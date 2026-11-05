import { EventEmitter } from 'events';
import { DirtyTracker } from './dirty-tracker.js';
import { SaveParticipantsPipeline } from './save-participants.js';
import { AtomicWriter } from './atomic-writer.js';
import type { AutoSaveMode, SavePipelineResult } from './types.js';

export interface SaveManagerOptions {
  mode?: AutoSaveMode;
  delayMs?: number; // default: 1000ms
  pipeline?: SaveParticipantsPipeline;
}

export class SaveManager extends EventEmitter {
  private mode: AutoSaveMode;
  private delayMs: number;
  private dirtyTracker: DirtyTracker;
  private pipeline: SaveParticipantsPipeline;
  private timers = new Map<string, NodeJS.Timeout>();
  private inMemoryBuffers = new Map<string, string>();

  constructor(options: SaveManagerOptions = {}) {
    super();
    this.mode = options.mode ?? 'afterDelay';
    this.delayMs = options.delayMs ?? 1000;
    this.dirtyTracker = new DirtyTracker();
    this.pipeline = options.pipeline || new SaveParticipantsPipeline();
  }

  public getDirtyTracker(): DirtyTracker {
    return this.dirtyTracker;
  }

  public setMode(mode: AutoSaveMode): void {
    this.mode = mode;
  }

  public updateBuffer(filePath: string, content: string): void {
    this.inMemoryBuffers.set(filePath, content);
    this.dirtyTracker.recordMutation(filePath);

    if (this.mode === 'afterDelay') {
      const existing = this.timers.get(filePath);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        this.saveDocument(filePath);
        this.timers.delete(filePath);
      }, this.delayMs);

      this.timers.set(filePath, timer);
    }
  }

  public onFocusChange(blurredFilePath: string): void {
    if (this.mode === 'onFocusChange' && this.dirtyTracker.isDirty(blurredFilePath)) {
      this.saveDocument(blurredFilePath);
    }
  }

  public onWindowChange(): void {
    if (this.mode === 'onWindowChange') {
      for (const [filePath, _content] of this.inMemoryBuffers.entries()) {
        if (this.dirtyTracker.isDirty(filePath)) {
          this.saveDocument(filePath);
        }
      }
    }
  }

  public async saveDocument(filePath: string): Promise<SavePipelineResult> {
    const rawBuffer = this.inMemoryBuffers.get(filePath);
    if (rawBuffer === undefined) {
      return {
        filePath,
        success: false,
        savedVersionId: 0,
        participantsExecuted: [],
        error: 'Buffer not found for document',
      };
    }

    this.emit('onWillSaveTextDocument', { filePath });

    // 1. Run Pre-Save Participants
    let processedContent = rawBuffer;
    let executedHooks: string[] = [];

    try {
      const res = await this.pipeline.executePipeline(filePath, rawBuffer);
      processedContent = res.content;
      executedHooks = res.executedHooks;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        filePath,
        success: false,
        savedVersionId: 0,
        participantsExecuted: executedHooks,
        error: `Pre-save hook failed: ${msg}`,
      };
    }

    // 2. Atomic write to disk
    try {
      await AtomicWriter.writeAtomic(filePath, processedContent);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        filePath,
        success: false,
        savedVersionId: 0,
        participantsExecuted: executedHooks,
        error: `Disk write failed: ${msg}`,
      };
    }

    // 3. Update dirty tracker and emit post-save
    const state = this.dirtyTracker.getState(filePath);
    const savedVersionId = state ? state.currentVersionId : 1;
    this.dirtyTracker.markSaved(filePath, savedVersionId);

    this.emit('onDidSaveTextDocument', {
      filePath,
      versionId: savedVersionId,
      content: processedContent,
    });

    return {
      filePath,
      success: true,
      savedVersionId,
      participantsExecuted: executedHooks,
    };
  }
}
