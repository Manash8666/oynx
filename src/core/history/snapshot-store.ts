import { gzipSync, gunzipSync } from 'zlib';
import type { Checkpoint } from './types.js';

export class SnapshotStore {
  private checkpoints = new Map<string, Checkpoint>();
  private maxStorageBytes: number;
  private maxAgeMs: number;

  constructor(maxStorageBytes = 500 * 1024 * 1024, maxAgeDays = 7) {
    this.maxStorageBytes = maxStorageBytes;
    this.maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  }

  public saveCheckpoint(checkpoint: Checkpoint): void {
    this.checkpoints.set(checkpoint.id, checkpoint);
    this.purgeExpiredOrOversized();
  }

  public getCheckpoint(id: string): Checkpoint | undefined {
    return this.checkpoints.get(id);
  }

  public getAllCheckpoints(): Checkpoint[] {
    return Array.from(this.checkpoints.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  public deleteCheckpoint(id: string): boolean {
    return this.checkpoints.delete(id);
  }

  public clear(): void {
    this.checkpoints.clear();
  }

  public compressText(text: string): Buffer {
    return gzipSync(Buffer.from(text, 'utf-8'));
  }

  public decompressText(buffer: Buffer): string {
    return gunzipSync(buffer).toString('utf-8');
  }

  private purgeExpiredOrOversized(): void {
    const now = Date.now();
    for (const [id, cp] of this.checkpoints.entries()) {
      if (now - cp.timestamp > this.maxAgeMs) {
        this.checkpoints.delete(id);
      }
    }
  }
}
