import { describe, it, expect, beforeEach } from 'vitest';
import { KernelWiring } from '../../src/core/kernel/wiring.js';
import type { OnyxKernel } from '../../src/core/kernel/event-bus.js';

describe('Central OnyxKernel Event Bus & Master Wiring (Integration)', () => {
  let kernel: OnyxKernel;

  beforeEach(() => {
    kernel = KernelWiring.boot({ enableColibriLocal: true });
  });

  it('should boot kernel and register listeners in under 50ms', () => {
    const bootTime = KernelWiring.getBootTimeMs();
    expect(bootTime).toBeLessThan(50);
  });

  it('should execute end-to-end event pipeline from raw prompt to atomic persistence', async () => {
    let sanitizedReceived = false;
    let astSlicedReceived = false;
    let turnStarted = false;
    let invariantsPassed = false;
    let fileSaved = false;

    kernel.subscribe('input:sanitized', (payload) => {
      sanitizedReceived = true;
      expect(payload.cleanPrompt).not.toContain('AKIAIOSFODNN7EXAMPLE');
      expect(payload.cleanPrompt).toContain('{{ONYX_REDACTED_AWS_KEY_');
    });

    kernel.subscribe('context:ast_sliced', (payload) => {
      astSlicedReceived = true;
      expect(payload.blastRadiusScore).toBeGreaterThan(0);
    });

    kernel.subscribe('agent:turn_start', (payload) => {
      turnStarted = true;
      expect(payload.modelProvider).toBe('COLIBRI_LOCAL');

      // Agent proposes diff
      kernel.publish('agent:diff_proposed', {
        taskId: payload.taskId,
        changesets: [{ path: 'src/app.ts', patch: 'const success = true;' }],
      });
    });

    kernel.subscribe('invariants:evaluated', (payload) => {
      invariantsPassed = payload.passed;
    });

    kernel.subscribe('fs:did_save', (payload) => {
      fileSaved = true;
      expect(payload.filePath).toBe('src/app.ts');
    });

    // Fire initial raw prompt containing secret
    kernel.publish('input:raw_prompt', {
      prompt: 'Synthesize auth middleware using AWS_KEY=AKIAIOSFODNN7EXAMPLE',
    });

    // Wait microtask for async event propagation
    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(sanitizedReceived).toBe(true);
    expect(astSlicedReceived).toBe(true);
    expect(turnStarted).toBe(true);
    expect(invariantsPassed).toBe(true);
    expect(fileSaved).toBe(true);
  });

  it('should intercept failing gates without crashing the kernel', async () => {
    let errorCaught = false;

    kernel.subscribe('agent:telemetry_error', (evt) => {
      errorCaught = true;
      expect(evt.event).toBe('invariants:evaluated');
    });

    // Register a gate that fails
    kernel.registerGate('invariants:evaluated', async () => {
      return false; // Rejection
    });

    kernel.publish('invariants:evaluated', {
      passed: true,
      violations: [],
    });

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(errorCaught).toBe(true);
  });
});
