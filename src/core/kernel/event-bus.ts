import { EventEmitter } from 'events';

export type OnyxEventMap = {
  // 1. Ingestion Phase
  'input:raw_prompt': { prompt: string; attachments?: Array<{ type: 'IMAGE' | 'VIDEO' | 'PDF'; buffer: Buffer }> };
  'input:sanitized': { cleanPrompt: string; redactedTokens: Map<string, string> };

  // 2. Context & AST Resolution
  'context:ast_sliced': { targetFiles: string[]; prunedAstGraph: object; blastRadiusScore: number };

  // 3. Inference & Consensus
  'agent:turn_start': { taskId: string; modelProvider: 'COLIBRI_LOCAL' | 'FRONTIER_CLOUD' };
  'agent:diff_proposed': { taskId: string; changesets: Array<{ path: string; patch: string }> };
  'consensus:critique': { approved: boolean; objections: string[] };

  // 4. Verification Gates
  'invariants:evaluated': { passed: boolean; violations: string[] };
  'runtime:shadow_executed': { exitCode: number; heapDelta?: object };
  'browser:cdp_verified': { passed: boolean; consoleErrors: string[]; recordedSpecPath?: string };

  // 5. Persistence Lifecycle
  'fs:will_save': { filePath: string; buffer: string };
  'fs:did_save': { filePath: string; versionId: number };
  'vcs:checkpoint_created': { checkpointId: string; commitHash: string };

  // Telemetry & Error
  'agent:telemetry_error': { event: string; error: string; timestamp: number };
};

export class OnyxKernel {
  private bus = new EventEmitter();
  private state = new Map<string, unknown>();

  constructor() {
    this.bus.setMaxListeners(50);
  }

  public publish<K extends keyof OnyxEventMap>(event: K, payload: OnyxEventMap[K]): void {
    this.bus.emit(event, payload);
  }

  public subscribe<K extends keyof OnyxEventMap>(
    event: K,
    handler: (payload: OnyxEventMap[K]) => void | Promise<void>
  ): void {
    this.bus.on(event, async (payload) => {
      try {
        await handler(payload);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.bus.emit('agent:telemetry_error', {
          event: String(event),
          error: errorMsg,
          timestamp: Date.now(),
        });
      }
    });
  }

  public registerGate<K extends keyof OnyxEventMap>(
    event: K,
    validator: (payload: OnyxEventMap[K]) => Promise<boolean> | boolean
  ): void {
    this.bus.prependListener(event, async (payload) => {
      try {
        const allowed = await validator(payload);
        if (!allowed) {
          throw new Error(`Gate failed for event: ${event}`);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.bus.emit('agent:telemetry_error', {
          event: String(event),
          error: errorMsg,
          timestamp: Date.now(),
        });
      }
    });
  }

  public setState(key: string, value: unknown): void {
    this.state.set(key, value);
  }

  public getState<T = unknown>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }
}
