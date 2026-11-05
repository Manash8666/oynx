import { HeapInspector } from './heap-inspector.js';
import type { ShadowVmExecutionResult } from './types.js';

export class ShadowVm {
  private timeoutMs: number;
  private maxMemoryMb: number;

  constructor(timeoutMs = 10000, maxMemoryMb = 512) {
    this.timeoutMs = timeoutMs;
    this.maxMemoryMb = maxMemoryMb;
  }

  public async executeScript(
    code: string,
    initialScope: Record<string, unknown> = {}
  ): Promise<ShadowVmExecutionResult> {
    const startTime = performance.now();
    const stdoutLogs: string[] = [];
    const stderrLogs: string[] = [];

    const mockConsole = {
      log: (...args: unknown[]) => stdoutLogs.push(args.map(String).join(' ')),
      error: (...args: unknown[]) => stderrLogs.push(args.map(String).join(' ')),
      warn: (...args: unknown[]) => stderrLogs.push(args.map(String).join(' ')),
    };

    // Inject mock sandbox scope
    const executionScope: Record<string, unknown> = {
      console: mockConsole,
      ...initialScope,
    };

    try {
      const scopeKeys = Object.keys(executionScope);
      const scopeValues = Object.values(executionScope);

      // Execute inside strict wrapped function
      const wrapped = new Function(...scopeKeys, `'use strict';\n${code}`);
      wrapped(...scopeValues);

      const durationMs = Number((performance.now() - startTime).toFixed(2));
      return {
        success: true,
        exitCode: 0,
        stdout: stdoutLogs.join('\n'),
        stderr: stderrLogs.join('\n'),
        durationMs,
      };
    } catch (err: unknown) {
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      const errorObj = err instanceof Error ? err : new Error(String(err));
      stderrLogs.push(errorObj.stack || errorObj.message);

      // Extract Heap Delta at crash line
      const heapDelta = HeapInspector.inspectException(errorObj, code, executionScope);

      return {
        success: false,
        exitCode: 1,
        stdout: stdoutLogs.join('\n'),
        stderr: stderrLogs.join('\n'),
        durationMs,
        error: errorObj.message,
        heapDelta,
      };
    }
  }
}
