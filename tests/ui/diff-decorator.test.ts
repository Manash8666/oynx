import { describe, it, expect, beforeEach } from 'vitest';
import { StreamingDiffDecorator } from '../../src/ui/editor/diff/streaming-decorator.js';
import { HunkManager } from '../../src/ui/editor/diff/hunk-manager.js';
import { DiffKeybindingHandler } from '../../src/ui/editor/diff/keybindings.js';

describe('Inline Streaming Diff & Hunk Decorator (Editor UI Layer)', () => {
  const originalCode = `
function calculateTax(amount: number): number {
  const rate = 0.05;
  return amount * rate;
}

function printInvoice(total: number): void {
  console.log("Total: " + total);
}
`.trim();

  let hunkManager: HunkManager;
  let decorator: StreamingDiffDecorator;

  beforeEach(() => {
    hunkManager = new HunkManager(originalCode);
    decorator = new StreamingDiffDecorator(originalCode, hunkManager);
  });

  it('should compute discrete hunks from modified stream', () => {
    const modifiedCode = `
function calculateTax(amount: number): number {
  const rate = 0.08;
  const surcharge = 2.50;
  return amount * rate + surcharge;
}

function printInvoice(total: number): void {
  console.log("Invoice Total: $" + total.toFixed(2));
}
`.trim();

    const renderState = decorator.renderDecorations();
    decorator.setFullStream(modifiedCode);
    const hunks = hunkManager.getHunks();

    expect(hunks.length).toBe(2);
    expect(hunks[0].originalRange.startLine).toBe(2);
    expect(hunks[1].originalText).toContain('console.log("Total: " + total);');
  });

  it('should recalculate line offsets for subsequent hunks on partial accept', () => {
    const orig = ['line1', 'line2', 'line3', 'line4', 'line5'].join('\n');
    const hm = new HunkManager(orig);

    // Hunk 1 at line 2: replaces 1 line with 3 lines (net delta: +2 lines)
    // Hunk 2 at line 4: replaces 1 line with 1 line
    hm.setHunks([
      {
        hunkId: 'h1',
        originalRange: { startLine: 2, endLine: 2 },
        originalText: 'line2',
        modifiedText: 'line2_a\nline2_b\nline2_c',
        modifiedLineCount: 3,
        status: 'PENDING',
      },
      {
        hunkId: 'h2',
        originalRange: { startLine: 4, endLine: 4 },
        originalText: 'line4',
        modifiedText: 'line4_mod',
        modifiedLineCount: 1,
        status: 'PENDING',
      },
    ]);

    // Accept Hunk 1
    const accepted = hm.acceptHunk('h1');
    expect(accepted).toBe(true);

    const hunks = hm.getHunks();
    expect(hunks[0].status).toBe('ACCEPTED');

    // Hunk 2 should have shifted from startLine 4 to startLine 6 (+2 delta)
    expect(hunks[1].originalRange.startLine).toBe(6);
    expect(hunks[1].originalRange.endLine).toBe(6);

    // Verify document content after partial accept
    const doc = hm.getDocumentContent();
    expect(doc).toContain('line2_a\nline2_b\nline2_c');
    expect(doc).toContain('line4'); // Hunk 2 not yet accepted
  });

  it('should handle keyboard shortcuts for accept all and reject all', () => {
    const orig = 'val1\nval2\nval3';
    const hm = new HunkManager(orig);
    hm.setHunks([
      {
        hunkId: 'h1',
        originalRange: { startLine: 1, endLine: 1 },
        originalText: 'val1',
        modifiedText: 'val1_new',
        modifiedLineCount: 1,
        status: 'PENDING',
      },
      {
        hunkId: 'h2',
        originalRange: { startLine: 3, endLine: 3 },
        originalText: 'val3',
        modifiedText: 'val3_new',
        modifiedLineCount: 1,
        status: 'PENDING',
      },
    ]);

    const handler = new DiffKeybindingHandler(hm);

    // Press Cmd+Shift+Y -> Accept All
    const handled = handler.handleKeyDown({
      key: 'y',
      ctrlKey: false,
      metaKey: true,
      shiftKey: true,
    });

    expect(handled).toBe(true);
    const hunks = hm.getHunks();
    expect(hunks.every((h) => h.status === 'ACCEPTED')).toBe(true);
    expect(hm.getDocumentContent()).toBe('val1_new\nval2\nval3_new');
  });

  it('should mark hunk as CONFLICT when developer manually edits within a pending range', () => {
    const hm = new HunkManager('line1\nline2\nline3');
    hm.setHunks([
      {
        hunkId: 'h1',
        originalRange: { startLine: 2, endLine: 2 },
        originalText: 'line2',
        modifiedText: 'line2_mod',
        modifiedLineCount: 1,
        status: 'PENDING',
      },
    ]);

    // User types on line 2
    hm.handleUserEdit({ startLine: 2, endLine: 2 });
    expect(hm.getHunk('h1')?.status).toBe('CONFLICT');
  });
});
