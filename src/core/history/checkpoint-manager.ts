import { readFile, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import { SnapshotStore } from './snapshot-store.js';
import { TimelineUiState } from './timeline-ui-state.js';
import type { Checkpoint, FileSnapshot } from './types.js';

export class CheckpointManager {
  private store: SnapshotStore;
  private timeline: TimelineUiState;

  constructor(store?: SnapshotStore, timeline?: TimelineUiState) {
    this.store = store || new SnapshotStore();
    this.timeline = timeline || new TimelineUiState();
  }

  public getStore(): SnapshotStore {
    return this.store;
  }

  public getTimeline(): TimelineUiState {
    return this.timeline;
  }

  public async createPreExecutionCheckpoint(
    agentTurnId: string,
    userPrompt: string,
    targetFiles: string[]
  ): Promise<Checkpoint> {
    const startTime = performance.now();
    const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const snapshots = new Map<string, FileSnapshot>();

    for (const filePath of targetFiles) {
      if (existsSync(filePath)) {
        try {
          const content = await readFile(filePath, 'utf-8');
          const hash = createHash('md5').update(content).digest('hex');
          snapshots.set(filePath, {
            filePath,
            content,
            hash,
            isNew: false,
          });
        } catch {
          // ignore unreadable
        }
      } else {
        snapshots.set(filePath, {
          filePath,
          content: '',
          hash: '',
          isNew: true,
        });
      }
    }

    const checkpoint: Checkpoint = {
      id,
      timestamp: Date.now(),
      agentTurnId,
      userPrompt,
      touchedFiles: [...targetFiles],
      createdFiles: [],
      snapshots,
    };

    this.store.saveCheckpoint(checkpoint);

    // Register with timeline UI
    this.timeline.addTurn({
      turnId: agentTurnId,
      checkpointId: id,
      prompt: userPrompt,
      status: 'PENDING',
      timestamp: checkpoint.timestamp,
      filesChanged: targetFiles.length,
    });

    return checkpoint;
  }

  public recordCreatedFile(checkpointId: string, filePath: string): void {
    const cp = this.store.getCheckpoint(checkpointId);
    if (cp && !cp.createdFiles.includes(filePath)) {
      cp.createdFiles.push(filePath);
    }
  }

  public async rollbackTo(
    checkpointId: string
  ): Promise<{ restoredFiles: string[]; deletedFiles: string[] }> {
    const cp = this.store.getCheckpoint(checkpointId);
    if (!cp) {
      throw new Error(`Checkpoint ${checkpointId} not found in store`);
    }

    const restoredFiles: string[] = [];
    const deletedFiles: string[] = [];

    // 1. Delete all files marked as created during or after this checkpoint
    for (const newFile of cp.createdFiles) {
      if (existsSync(newFile)) {
        try {
          await unlink(newFile);
          deletedFiles.push(newFile);
        } catch {
          // ignore
        }
      }
    }

    // 2. Revert all snapshots
    for (const snapshot of cp.snapshots.values()) {
      if (snapshot.isNew) {
        if (existsSync(snapshot.filePath)) {
          try {
            await unlink(snapshot.filePath);
            deletedFiles.push(snapshot.filePath);
          } catch {
            // ignore
          }
        }
      } else {
        await writeFile(snapshot.filePath, snapshot.content, 'utf-8');
        restoredFiles.push(snapshot.filePath);
      }
    }

    // Update timeline
    this.timeline.updateTurnStatus(cp.agentTurnId, 'REVERTED');

    return { restoredFiles, deletedFiles };
  }
}
