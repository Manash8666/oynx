import { EventEmitter } from 'events';
import { HunkManager } from './hunk-manager.js';
import type { DecorationRenderState, DiffHunk, LineRange, StreamingDiffDelta } from './types.js';

export class StreamingDiffDecorator extends EventEmitter {
  private originalContent: string;
  private currentStreamBuffer = '';
  private hunkManager: HunkManager;
  private renderDebounceTimer: NodeJS.Timeout | null = null;
  private renderFpsIntervalMs = 16; // 60fps debounce

  constructor(originalContent = '', hunkManager?: HunkManager) {
    super();
    this.originalContent = originalContent;
    this.hunkManager = hunkManager || new HunkManager(originalContent);
  }

  public getHunkManager(): HunkManager {
    return this.hunkManager;
  }

  public appendStreamChunk(chunk: string): void {
    this.currentStreamBuffer += chunk;
    this.scheduleDebouncedRender();
  }

  public setFullStream(fullText: string): void {
    this.currentStreamBuffer = fullText;
    this.renderDecorations();
  }

  public scheduleDebouncedRender(): void {
    if (this.renderDebounceTimer) return;
    this.renderDebounceTimer = setTimeout(() => {
      this.renderDebounceTimer = null;
      this.renderDecorations();
    }, this.renderFpsIntervalMs);
  }

  public renderDecorations(): DecorationRenderState {
    const originalLines = this.originalContent.split(/\r?\n/);
    const candidateLines = this.currentStreamBuffer.split(/\r?\n/);

    const hunks = this.computeHunks(originalLines, candidateLines);
    this.hunkManager.setHunks(hunks);

    const decorations = hunks.map((hunk, idx) => ({
      id: `dec_${idx}_${hunk.hunkId}`,
      hunkId: hunk.hunkId,
      range: hunk.originalRange,
      className: hunk.status === 'ACCEPTED' ? 'diff-accepted' : 'diff-pending-virtual-green',
    }));

    const renderState: DecorationRenderState = {
      hunkCount: hunks.length,
      pendingCount: hunks.filter((h) => h.status === 'PENDING').length,
      decorations,
    };

    this.emit('decorationsRendered', renderState);
    return renderState;
  }

  /**
   * Compute exact line-by-line diff deltas using LCS (Longest Common Subsequence)
   * and group into contiguous DiffHunks.
   */
  public computeHunks(originalLines: string[], modifiedLines: string[]): DiffHunk[] {
    const hunks: DiffHunk[] = [];
    const n = originalLines.length;
    const m = modifiedLines.length;

    // LCS dynamic programming table
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (originalLines[i - 1] === modifiedLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find diff operations
    type DiffOp = { type: 'equal' | 'delete' | 'insert'; origIdx?: number; modIdx?: number; text: string };
    const ops: DiffOp[] = [];

    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && originalLines[i - 1] === modifiedLines[j - 1]) {
        ops.unshift({ type: 'equal', origIdx: i - 1, modIdx: j - 1, text: originalLines[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        ops.unshift({ type: 'insert', modIdx: j - 1, text: modifiedLines[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        ops.unshift({ type: 'delete', origIdx: i - 1, text: originalLines[i - 1] });
        i--;
      }
    }

    // Group contiguous non-equal operations into hunks
    let hunkId = 1;
    let currentOrigStart = -1;
    let currentOrigEnd = -1;
    let origHunkLines: string[] = [];
    let modHunkLines: string[] = [];

    const flush = () => {
      if (origHunkLines.length > 0 || modHunkLines.length > 0) {
        const start = currentOrigStart !== -1 ? currentOrigStart + 1 : 1;
        const end = currentOrigEnd !== -1 ? currentOrigEnd + 1 : start;
        hunks.push({
          hunkId: `hunk_${hunkId++}_${start}`,
          originalRange: { startLine: start, endLine: end },
          originalText: origHunkLines.join('\n'),
          modifiedText: modHunkLines.join('\n'),
          modifiedLineCount: modHunkLines.length,
          status: 'PENDING',
        });
        currentOrigStart = -1;
        currentOrigEnd = -1;
        origHunkLines = [];
        modHunkLines = [];
      }
    };

    for (const op of ops) {
      if (op.type === 'equal') {
        flush();
      } else {
        if (op.type === 'delete') {
          if (currentOrigStart === -1) currentOrigStart = op.origIdx!;
          currentOrigEnd = op.origIdx!;
          origHunkLines.push(op.text);
        } else if (op.type === 'insert') {
          modHunkLines.push(op.text);
        }
      }
    }
    flush();

    return hunks;
  }
}
