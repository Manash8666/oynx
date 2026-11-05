import { EventEmitter } from 'events';
import type { DiffHunk, HunkStatus, LineRange } from './types.js';

export class HunkManager extends EventEmitter {
  private hunks: DiffHunk[] = [];
  private documentLines: string[] = [];

  constructor(originalContent = '') {
    super();
    this.setDocumentContent(originalContent);
  }

  public setDocumentContent(content: string): void {
    this.documentLines = content.split(/\r?\n/);
  }

  public getDocumentContent(): string {
    return this.documentLines.join('\n');
  }

  public getHunks(): DiffHunk[] {
    return [...this.hunks];
  }

  public getHunk(hunkId: string): DiffHunk | undefined {
    return this.hunks.find((h) => h.hunkId === hunkId);
  }

  public setHunks(hunks: DiffHunk[]): void {
    this.hunks = hunks;
    this.emit('hunksChanged', this.hunks);
  }

  /**
   * Accepts a specific hunk and dynamically recalculates line offsets for all subsequent hunks
   */
  public acceptHunk(hunkId: string): boolean {
    const hunkIdx = this.hunks.findIndex((h) => h.hunkId === hunkId);
    if (hunkIdx === -1) return false;

    const hunk = this.hunks[hunkIdx];
    if (hunk.status !== 'PENDING') return false;

    const startLineIdx = hunk.originalRange.startLine - 1;
    const endLineIdx = hunk.originalRange.endLine - 1;
    const originalLineCount = endLineIdx - startLineIdx + 1;

    const newLines = hunk.modifiedText.split(/\r?\n/);
    const newLineCount = newLines.length;

    // Apply mutation to document lines
    this.documentLines.splice(startLineIdx, originalLineCount, ...newLines);
    hunk.status = 'ACCEPTED';

    // Recalculate line offsets for all subsequent pending hunks
    const delta = newLineCount - originalLineCount;
    if (delta !== 0) {
      for (let i = hunkIdx + 1; i < this.hunks.length; i++) {
        const nextHunk = this.hunks[i];
        if (nextHunk.status === 'PENDING') {
          nextHunk.originalRange.startLine += delta;
          nextHunk.originalRange.endLine += delta;
        }
      }
    }

    this.emit('hunkAccepted', { hunkId, documentContent: this.getDocumentContent() });
    this.emit('hunksChanged', this.hunks);
    return true;
  }

  public rejectHunk(hunkId: string): boolean {
    const hunk = this.hunks.find((h) => h.hunkId === hunkId);
    if (!hunk || hunk.status !== 'PENDING') return false;

    hunk.status = 'REJECTED';
    this.emit('hunkRejected', { hunkId });
    this.emit('hunksChanged', this.hunks);
    return true;
  }

  public acceptAll(): void {
    // Accept from first to last, line recalculations occur in each pass
    for (const hunk of this.hunks) {
      if (hunk.status === 'PENDING') {
        this.acceptHunk(hunk.hunkId);
      }
    }
  }

  public rejectAll(): void {
    for (const hunk of this.hunks) {
      if (hunk.status === 'PENDING') {
        hunk.status = 'REJECTED';
      }
    }
    this.emit('hunksChanged', this.hunks);
  }

  /**
   * Detect conflict if user edits document lines within a pending hunk range
   */
  public handleUserEdit(editRange: LineRange): void {
    for (const hunk of this.hunks) {
      if (hunk.status === 'PENDING') {
        if (
          (editRange.startLine >= hunk.originalRange.startLine && editRange.startLine <= hunk.originalRange.endLine) ||
          (editRange.endLine >= hunk.originalRange.startLine && editRange.endLine <= hunk.originalRange.endLine)
        ) {
          hunk.status = 'CONFLICT';
          this.emit('hunkConflict', hunk);
        }
      }
    }
    this.emit('hunksChanged', this.hunks);
  }
}
