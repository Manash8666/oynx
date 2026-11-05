import { describe, it, expect, beforeEach } from 'vitest';
import { ShadowVm } from '../../src/core/runtime/shadow-vm.js';

describe('Deterministic Shadow-Fork Runtime with Memory Heap Delta (Unique to Onyx)', () => {
  let vm: ShadowVm;

  beforeEach(() => {
    vm = new ShadowVm(5000, 256);
  });

  it('should successfully execute clean script and capture stdout', async () => {
    const code = `
const a = 10;
const b = 20;
console.log("SUM: " + (a + b));
`;
    const res = await vm.executeScript(code);

    expect(res.success).toBe(true);
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain('SUM: 30');
    expect(res.heapDelta).toBeUndefined();
  });

  it('should pause on deliberate null-dereference and extract structured heap delta', async () => {
    const faultyScript = `
const user = { id: "usr_102", name: "Alice", profile: null };
const theme = user.profile.settings.theme;
console.log(theme);
`;
    const res = await vm.executeScript(faultyScript);

    expect(res.success).toBe(false);
    expect(res.exitCode).toBe(1);
    expect(res.error).toBeDefined();

    // Verify structured Heap Delta Summary
    expect(res.heapDelta).toBeDefined();
    const delta = res.heapDelta!;
    expect(delta.failingInstruction).toContain('user.profile.settings.theme');
    expect(delta.rootCause).toContain('null');
    expect(delta.scopeHeap).toBeDefined();
    expect(delta.tokenEstimate).toBeLessThan(400); // Strict <400 tokens invariant
  });
});
