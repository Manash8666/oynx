import { describe, it, expect, beforeEach } from 'vitest';
import { GhostTextEngine } from '../../src/core/completion/ghost-engine.js';
import { GhostTextController } from '../../src/ui/editor/ghost-text-controller.js';

describe('Speculative Sub-10ms Ghost Text Engine (Colibri System One)', () => {
  let engine: GhostTextEngine;
  let controller: GhostTextController;

  beforeEach(() => {
    engine = new GhostTextEngine();
    controller = new GhostTextController();
  });

  it('should generate speculative completion in under 40ms with valid balanced syntax', async () => {
    const code = `
export function validateSession(sessionToken: string): boolean {
  if (
`;
    const cursor = { line: 3, column: 7 };

    const start = performance.now();
    const proposal = await engine.generateCompletion('src/auth.ts', code, cursor);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(40);
    expect(proposal).not.toBeNull();
    expect(proposal?.isValidSyntax).toBe(true);
    expect(proposal?.completionText).toContain('!valid) return false;');
  });

  it('should handle word-by-word accept and Tab full accept via GhostTextController', () => {
    controller.setProposal({
      completionText: 'isValidSession(token) === true;',
      latencyMs: 3.5,
      isValidSyntax: true,
      acceptedWordsCount: 0,
    });

    expect(controller.getVisibleGhostText()).toBe('isValidSession(token) === true;');

    // Word-by-word accept (Cmd+Right)
    const word1 = controller.handleKeyDown({ key: 'ArrowRight', ctrlKey: false, metaKey: true });
    expect(word1.handled).toBe(true);
    expect(word1.acceptedText).toBe('isValidSession(token)');

    // Tab accepts the remainder
    const full = controller.handleKeyDown({ key: 'Tab', ctrlKey: false, metaKey: false });
    expect(full.handled).toBe(true);
    expect(full.acceptedText).toBe('isValidSession(token) === true;');
    expect(controller.getActiveProposal()).toBeNull();
  });

  it('should auto-suppress ghost text in .env files or password fields', async () => {
    const envCode = 'STRIPE_KEY=sk_live_123\n';
    const proposal = await engine.generateCompletion('.env.local', envCode, { line: 1, column: 11 });
    expect(proposal).toBeNull();
  });
});
