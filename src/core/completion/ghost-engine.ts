import { ContextWindowSlicer } from './context-window.js';
import { AstCompletionValidator } from './ast-validator.js';
import type { CursorPosition, GhostTextProposal } from './types.js';

export class GhostTextEngine {
  private deadlineMs = 35;

  public async generateCompletion(
    filePath: string,
    content: string,
    cursor: CursorPosition
  ): Promise<GhostTextProposal | null> {
    const startTime = performance.now();

    // Auto-suppress in .env files or passwords
    if (/\.env(?:\..*)?$/i.test(filePath) || /password/i.test(content.split(/\r?\n/)[cursor.line - 1] || '')) {
      return null;
    }

    const context = ContextWindowSlicer.slice(content, cursor);

    // Speculative fast-path completion logic (Colibri System One emulation)
    let candidate = '';
    const activeLine = context.activeLineText.trim();

    if (activeLine.startsWith('if (')) {
      candidate = '!valid) return false;';
    } else if (activeLine.endsWith('return ')) {
      candidate = context.scopeIdentifiers[0] ? `${context.scopeIdentifiers[0]};` : 'true;';
    } else if (activeLine.includes('console.log(')) {
      candidate = '"[DEBUG] " + data);';
    } else {
      candidate = context.scopeIdentifiers.length > 0 ? `${context.scopeIdentifiers[0]}();` : '1;';
    }

    // Validate and auto-balance syntax
    const validation = AstCompletionValidator.validateAndBalance(context.activeLineText, candidate);
    if (!validation.valid) {
      return null;
    }

    const duration = performance.now() - startTime;
    if (duration > this.deadlineMs) {
      // Abort if deadline exceeded
      return null;
    }

    return {
      completionText: validation.balanced,
      latencyMs: Number(duration.toFixed(2)),
      isValidSyntax: true,
      acceptedWordsCount: 0,
    };
  }
}
