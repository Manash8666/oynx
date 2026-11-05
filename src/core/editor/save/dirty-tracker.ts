import { EventEmitter } from 'events';
import type { DocumentDirtyState } from './types.js';

export class DirtyTracker extends EventEmitter {
  private documents = new Map<string, { currentVersion: number; lastSavedVersion: number }>();

  public registerDocument(filePath: string, initialVersion = 1): void {
    this.documents.set(filePath, {
      currentVersion: initialVersion,
      lastSavedVersion: initialVersion,
    });
  }

  public recordMutation(filePath: string): number {
    const doc = this.documents.get(filePath) || { currentVersion: 0, lastSavedVersion: 0 };
    doc.currentVersion++;
    this.documents.set(filePath, doc);

    const isDirty = doc.currentVersion !== doc.lastSavedVersion;
    this.emit('dirtyChanged', {
      filePath,
      isDirty,
      currentVersionId: doc.currentVersion,
      lastSavedVersionId: doc.lastSavedVersion,
    });

    return doc.currentVersion;
  }

  public markSaved(filePath: string, versionId?: number): void {
    const doc = this.documents.get(filePath);
    if (doc) {
      doc.lastSavedVersion = versionId ?? doc.currentVersion;
      this.emit('dirtyChanged', {
        filePath,
        isDirty: false,
        currentVersionId: doc.currentVersion,
        lastSavedVersionId: doc.lastSavedVersion,
      });
    }
  }

  public isDirty(filePath: string): boolean {
    const doc = this.documents.get(filePath);
    if (!doc) return false;
    return doc.currentVersion !== doc.lastSavedVersion;
  }

  public canCloseTab(filePath: string): boolean {
    return !this.isDirty(filePath);
  }

  public getState(filePath: string): DocumentDirtyState | undefined {
    const doc = this.documents.get(filePath);
    if (!doc) return undefined;
    return {
      filePath,
      isDirty: doc.currentVersion !== doc.lastSavedVersion,
      currentVersionId: doc.currentVersion,
      lastSavedVersionId: doc.lastSavedVersion,
    };
  }
}
