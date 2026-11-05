import { EventEmitter } from 'events';
import { DapClient } from './dap-client.js';
import { BreakpointStore } from './breakpoint-store.js';
import { VariableResolver } from './variable-resolver.js';
import type { DebugSessionState, Scope, StackFrame } from './types.js';

export class DapSessionManager extends EventEmitter {
  private sessions = new Map<string, { client: DapClient; state: DebugSessionState }>();
  private breakpointStore: BreakpointStore;
  private variableResolver: VariableResolver;
  private activeSessionId?: string;

  constructor() {
    super();
    this.breakpointStore = new BreakpointStore();
    this.variableResolver = new VariableResolver();
  }

  public getBreakpointStore(): BreakpointStore {
    return this.breakpointStore;
  }

  public getVariableResolver(): VariableResolver {
    return this.variableResolver;
  }

  public async startSession(sessionId: string, program: string): Promise<DapClient> {
    const client = new DapClient();
    const state: DebugSessionState = {
      sessionId,
      status: 'INITIALIZING',
    };

    client.on('stopped', ({ reason, frame }) => {
      state.status = 'STOPPED';
      state.currentFrame = frame;
      state.stopReason = reason;
      this.emit('sessionStopped', { sessionId, reason, frame });
    });

    client.on('terminated', () => {
      state.status = 'TERMINATED';
      this.emit('sessionTerminated', { sessionId });
    });

    await client.launch(program);
    state.status = 'RUNNING';

    this.sessions.set(sessionId, { client, state });
    this.activeSessionId = sessionId;

    return client;
  }

  public getActiveSession(): { client: DapClient; state: DebugSessionState } | undefined {
    if (!this.activeSessionId) return undefined;
    return this.sessions.get(this.activeSessionId);
  }

  // Agent-callable tools
  public async debug_step_over(): Promise<StackFrame | undefined> {
    const session = this.getActiveSession();
    if (session) {
      await session.client.stepOver();
      return session.state.currentFrame;
    }
    return undefined;
  }

  public async debug_step_into(): Promise<StackFrame | undefined> {
    const session = this.getActiveSession();
    if (session) {
      await session.client.stepInto();
      return session.state.currentFrame;
    }
    return undefined;
  }

  public async debug_get_stack_frame(): Promise<StackFrame | undefined> {
    const session = this.getActiveSession();
    return session?.state.currentFrame;
  }

  public async debug_get_variables(): Promise<Record<string, Record<string, string>>> {
    const session = this.getActiveSession();
    if (!session) return {};
    const scopes = await session.client.scopes();
    return this.variableResolver.serializeForAgent(scopes);
  }

  public async debug_evaluate_expression(expr: string): Promise<string> {
    const session = this.getActiveSession();
    if (!session) return 'No active debug session';
    const evalRes = await session.client.evaluate(expr);
    return evalRes.result;
  }

  public terminateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.client.terminate();
      this.sessions.delete(sessionId);
      if (this.activeSessionId === sessionId) {
        this.activeSessionId = undefined;
      }
    }
  }
}
