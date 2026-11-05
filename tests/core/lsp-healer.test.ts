import { describe, it, expect, beforeEach } from 'vitest';
import { DiagnosticCollector } from '../../src/core/lsp/diagnostic-collector.js';
import { LspClientPool } from '../../src/core/lsp/client-pool.js';
import { SelfHealer } from '../../src/core/agent/self-healer.js';

describe('LSP Diagnostic Feedback & Self-Healing Loop (Prompt 4)', () => {
  let collector: DiagnosticCollector;
  let pool: LspClientPool;
  let healer: SelfHealer;

  beforeEach(() => {
    // 0ms debounce for instantaneous unit test feedback
    collector = new DiagnosticCollector(0);
    pool = new LspClientPool(collector);
    healer = new SelfHealer(collector, 3);
  });

  it('should detect staged syntax errors and publish actionable LSP diagnostics', async () => {
    const brokenCode = `
import { UserService } from './user.js';

export function runAuth() {
  const = 123;
  return true;
}
`;
    pool.didOpen('src/auth.ts', brokenCode);

    // Wait microtask for 0ms timer
    await new Promise((resolve) => setTimeout(resolve, 20));

    const errors = collector.getErrors('src/auth.ts');
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors[0].line).toBe(5);
    expect(errors[0].message).toContain('Variable declaration expected identifier');
  });

  it('should construct concise targeted remediation prompt with line ranges', async () => {
    const brokenCode = `
import { Config } from './config.js';

export function badCall() {
  throw new UndefinedError();
}
`;
    pool.didOpen('src/bad.ts', brokenCode);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const errors = collector.getErrors('src/bad.ts');
    const prompt = healer.constructRemediationPrompt('src/bad.ts', errors, brokenCode);

    expect(prompt).toContain('[LSP COMPILER SELF-HEALING REQUEST]');
    expect(prompt).toContain("Cannot find name 'UndefinedError'");
    expect(prompt).toContain('throw new UndefinedError()');
    expect(prompt).toContain('Instructions: Provide an exact fix');
  });

  it('should escalate to developer when self-healing passes exceed 3 retries', async () => {
    const brokenCode = `
export function loopFail() {
  const = 404;
}
`;
    pool.didOpen('src/loop.ts', brokenCode);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const fileMap = new Map([['src/loop.ts', brokenCode]]);
    const taskId = 'heal-task-1';

    // Pass 1
    const p1 = await healer.evaluateHealingPass(taskId, ['src/loop.ts'], fileMap);
    expect(p1.passNumber).toBe(1);
    expect(p1.healed).toBe(false);
    expect(p1.escalatedToUser).toBe(false);

    // Pass 2
    const p2 = await healer.evaluateHealingPass(taskId, ['src/loop.ts'], fileMap);
    expect(p2.passNumber).toBe(2);
    expect(p2.escalatedToUser).toBe(false);

    // Pass 3 (Max limit reached -> escalate)
    const p3 = await healer.evaluateHealingPass(taskId, ['src/loop.ts'], fileMap);
    expect(p3.passNumber).toBe(3);
    expect(p3.escalatedToUser).toBe(true);
  });

  it('should resolve and mark healed when simulated patch fixes the error', async () => {
    const brokenCode = 'const = 1;';
    const fixedCode = 'const valid = 1;';

    pool.didOpen('src/fix.ts', brokenCode);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const fileMap = new Map([['src/fix.ts', brokenCode]]);
    const taskId = 'heal-task-fix';

    const result = await healer.evaluateHealingPass(
      taskId,
      ['src/fix.ts'],
      fileMap,
      async (path, _prompt) => {
        // Simulated fix
        pool.didChange(path, fixedCode);
        return true;
      }
    );

    expect(result.passNumber).toBe(1);
    expect(result.healed).toBe(true);
  });
});
