import { EventEmitter } from 'events';
import type { BreakpointRecord, Scope, SourceBreakpoint, StackFrame, Variable } from './types.js';

export class DapClient extends EventEmitter {
  private seq = 1;
  private isInitialized = false;
  private activeFrames: StackFrame[] = [];
  private activeScopes: Scope[] = [];

  public async initialize(): Promise<{ supportsConditionalBreakpoints: boolean }> {
    this.isInitialized = true;
    return { supportsConditionalBreakpoints: true };
  }

  public async launch(program: string, args: string[] = []): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();
    this.emit('output', { category: 'stdout', output: `Launched ${program} with args: ${args.join(' ')}\n` });
    return true;
  }

  public async setBreakpoints(filePath: string, breakpoints: SourceBreakpoint[]): Promise<BreakpointRecord[]> {
    return breakpoints.map((b, idx) => ({
      id: `dap_bp_${idx}`,
      filePath,
      line: b.line,
      condition: b.condition,
      verified: true,
    }));
  }

  public async configurationDone(): Promise<void> {
    this.emit('continued');
  }

  public async stackTrace(): Promise<StackFrame[]> {
    return [...this.activeFrames];
  }

  public setSimulatedStopped(frame: StackFrame, scopes: Scope[], reason = 'breakpoint'): void {
    this.activeFrames = [frame];
    this.activeScopes = scopes;
    this.emit('stopped', { reason, frame });
  }

  public async scopes(): Promise<Scope[]> {
    return [...this.activeScopes];
  }

  public async stepOver(): Promise<void> {
    if (this.activeFrames.length > 0) {
      this.activeFrames[0].line += 1;
      this.emit('stopped', { reason: 'step', frame: this.activeFrames[0] });
    }
  }

  public async stepInto(): Promise<void> {
    if (this.activeFrames.length > 0) {
      this.activeFrames[0].line += 1;
      this.emit('stopped', { reason: 'step', frame: this.activeFrames[0] });
    }
  }

  public async stepOut(): Promise<void> {
    if (this.activeFrames.length > 0) {
      this.emit('stopped', { reason: 'step', frame: this.activeFrames[0] });
    }
  }

  public async evaluate(expression: string, timeoutMs = 5000): Promise<{ result: string; type: string }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`DAP evaluation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      try {
        // Safe evaluation of simple expressions
        if (/^[\d\s+\-*/().]+$/.test(expression.trim())) {
          // eslint-disable-next-line no-eval
          const val = Function(`'use strict'; return (${expression})`)();
          clearTimeout(timer);
          return resolve({ result: String(val), type: typeof val });
        }
        clearTimeout(timer);
        return resolve({ result: `[Evaluated: ${expression}]`, type: 'string' });
      } catch (err: unknown) {
        clearTimeout(timer);
        const msg = err instanceof Error ? err.message : String(err);
        return resolve({ result: `Evaluation Error: ${msg}`, type: 'error' });
      }
    });
  }

  public terminate(): void {
    this.emit('terminated');
    this.activeFrames = [];
    this.activeScopes = [];
  }
}
