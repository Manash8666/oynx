import { describe, it, expect, beforeEach } from 'vitest';
import { DapSessionManager } from '../../src/core/dap/session-manager.js';
import type { Scope, StackFrame } from '../../src/core/dap/types.js';

describe('Debug Adapter Protocol (DAP) Subsystem (VS Code Parity)', () => {
  let sessionManager: DapSessionManager;

  beforeEach(() => {
    sessionManager = new DapSessionManager();
  });

  it('should launch session, hit simulated breakpoint, retrieve variables, and step over lines', async () => {
    const sessionId = 'debug-session-1';
    const client = await sessionManager.startSession(sessionId, 'node src/index.js');

    // 1. Set simulated breakpoint
    const bpStore = sessionManager.getBreakpointStore();
    const bps = bpStore.setBreakpoints('src/index.js', [{ line: 15, condition: 'x > 5' }]);
    expect(bps.length).toBe(1);
    expect(bps[0].verified).toBe(true);

    // 2. Register local scope variables
    const resolver = sessionManager.getVariableResolver();
    const localScope = resolver.registerScopeVariables('Local', {
      userId: 'usr_505',
      retryCount: 3,
      metadata: { role: 'admin', active: true },
    });

    const frame: StackFrame = {
      id: 1,
      name: 'handleLogin',
      filePath: 'src/index.js',
      line: 15,
      column: 1,
    };

    client.setSimulatedStopped(frame, [localScope], 'breakpoint');

    // 3. Verify stopped frame and variables
    const currentFrame = await sessionManager.debug_get_stack_frame();
    expect(currentFrame?.line).toBe(15);
    expect(currentFrame?.name).toBe('handleLogin');

    const serializedVars = await sessionManager.debug_get_variables();
    expect(serializedVars['Local']).toBeDefined();
    expect(serializedVars['Local']['userId']).toBe('"usr_505"');
    expect(serializedVars['Local']['retryCount']).toBe('3');

    // 4. Step over 2 lines
    await sessionManager.debug_step_over();
    const step1 = await sessionManager.debug_get_stack_frame();
    expect(step1?.line).toBe(16);

    await sessionManager.debug_step_over();
    const step2 = await sessionManager.debug_get_stack_frame();
    expect(step2?.line).toBe(17);

    // 5. Evaluate mathematical expression
    const evalResult = await sessionManager.debug_evaluate_expression('40 + 2 * 3');
    expect(evalResult).toBe('46');

    // 6. Terminate session
    sessionManager.terminateSession(sessionId);
    expect(sessionManager.getActiveSession()).toBeUndefined();
  });
});
