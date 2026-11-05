import type { HunkManager } from './hunk-manager.js';

export class DiffKeybindingHandler {
  private hunkManager: HunkManager;
  private activeHunkIndex = 0;

  constructor(hunkManager: HunkManager) {
    this.hunkManager = hunkManager;
  }

  public handleKeyDown(event: {
    key: string;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
  }): boolean {
    const isCmd = event.ctrlKey || event.metaKey;

    // Accept All: Cmd+Shift+Y
    if (isCmd && event.shiftKey && event.key.toLowerCase() === 'y') {
      this.hunkManager.acceptAll();
      return true;
    }

    // Reject All: Cmd+Shift+N
    if (isCmd && event.shiftKey && event.key.toLowerCase() === 'n') {
      this.hunkManager.rejectAll();
      return true;
    }

    const pendingHunks = this.hunkManager.getHunks().filter((h) => h.status === 'PENDING');
    if (pendingHunks.length === 0) return false;

    // Step next/prev: Tab / Shift+Tab
    if (event.key === 'Tab' && !isCmd) {
      if (event.shiftKey) {
        this.activeHunkIndex = (this.activeHunkIndex - 1 + pendingHunks.length) % pendingHunks.length;
      } else {
        // Tab accepts active hunk
        const currentHunk = pendingHunks[this.activeHunkIndex] || pendingHunks[0];
        if (currentHunk) {
          this.hunkManager.acceptHunk(currentHunk.hunkId);
          return true;
        }
      }
      return true;
    }

    // Dismiss active: Escape
    if (event.key === 'Escape') {
      const currentHunk = pendingHunks[this.activeHunkIndex] || pendingHunks[0];
      if (currentHunk) {
        this.hunkManager.rejectHunk(currentHunk.hunkId);
        return true;
      }
    }

    return false;
  }
}
