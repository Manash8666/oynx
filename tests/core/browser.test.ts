import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CDPListener, type CDPSessionLike } from '../../src/core/browser/cdp-listener.js';
import { BrowserRunner } from '../../src/core/browser/runner.js';
import {
  browser_navigate,
  browser_interact,
  browser_capture_trace,
  browser_export_spec,
  browserToolDefinitions,
  resetBrowserRunner,
} from '../../src/core/agent/tools.js';
import type { Page } from 'playwright';
import { rm, readFile } from 'fs/promises';
import { join } from 'path';

class MockCDPSession implements CDPSessionLike {
  public sentMethods: string[] = [];
  public listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
  public detached = false;

  async send(method: string, _params?: Record<string, unknown>): Promise<unknown> {
    this.sentMethods.push(method);
    return {};
  }

  on(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event: string, listener: (...args: unknown[]) => void): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
    }
  }

  async detach(): Promise<void> {
    this.detached = true;
  }

  emit(event: string, data: unknown): void {
    const list = this.listeners[event] || [];
    for (const fn of list) {
      fn(data);
    }
  }
}

describe('Browser Verification Engine - CDPListener', () => {
  let mockPage: Page;
  let mockSession: MockCDPSession;
  let listener: CDPListener;

  beforeEach(() => {
    mockSession = new MockCDPSession();
    mockPage = {
      context: () => ({
        newCDPSession: async () => mockSession,
      }),
    } as unknown as Page;

    listener = new CDPListener(mockPage, mockSession);
  });

  it('enables CDP domains and attaches event listeners on start', async () => {
    await listener.start();

    expect(mockSession.sentMethods).toContain('Runtime.enable');
    expect(mockSession.sentMethods).toContain('Console.enable');
    expect(mockSession.sentMethods).toContain('Network.enable');
  });

  it('captures uncaught exceptions from Runtime.exceptionThrown with stack traces', async () => {
    await listener.start();

    mockSession.emit('Runtime.exceptionThrown', {
      exceptionDetails: {
        text: 'Uncaught TypeError: Cannot read property of undefined',
        exception: { description: 'TypeError: Cannot read property of undefined' },
        stackTrace: {
          callFrames: [
            { functionName: 'handleClick', url: 'https://app.local/bundle.js', lineNumber: 42, columnNumber: 15 },
          ],
        },
      },
    });

    const telemetry = listener.getTelemetry();
    expect(telemetry.uncaughtExceptions).toHaveLength(1);
    expect(telemetry.uncaughtExceptions[0].message).toContain('TypeError');
    expect(telemetry.uncaughtExceptions[0].stack).toContain('handleClick');
  });

  it('captures console messages from Console.messageAdded', async () => {
    await listener.start();

    mockSession.emit('Console.messageAdded', {
      message: {
        level: 'warning',
        text: 'Failed to prefetch component asset',
        url: 'https://app.local/main.js',
        line: 104,
        column: 8,
      },
    });

    const telemetry = listener.getTelemetry();
    expect(telemetry.consoleMessages).toHaveLength(1);
    expect(telemetry.consoleMessages[0].type).toBe('warning');
    expect(telemetry.consoleMessages[0].text).toBe('Failed to prefetch component asset');
  });

  it('filters 4xx/5xx network responses and ignores 2xx/3xx successes', async () => {
    await listener.start();

    // 200 OK -> ignored
    mockSession.emit('Network.responseReceived', {
      response: { url: 'https://api.local/v1/user', status: 200, statusText: 'OK' },
    });

    // 404 Not Found -> trapped
    mockSession.emit('Network.responseReceived', {
      response: { url: 'https://api.local/v1/missing', status: 404, statusText: 'Not Found' },
    });

    // 500 Internal Error -> trapped
    mockSession.emit('Network.responseReceived', {
      response: { url: 'https://api.local/v1/crash', status: 500, statusText: 'Internal Error' },
    });

    const telemetry = listener.getTelemetry();
    expect(telemetry.networkFailures).toHaveLength(2);
    expect(telemetry.networkFailures.map((n) => n.status)).toEqual([404, 500]);
  });

  it('computes telemetry deltas correctly since timestamp', async () => {
    await listener.start();

    mockSession.emit('Console.messageAdded', {
      message: { level: 'log', text: 'Step 1' },
    });

    await new Promise((r) => setTimeout(r, 10));
    const checkpoint = Date.now();
    await new Promise((r) => setTimeout(r, 10));

    const deltaBefore = listener.getDeltaSince(checkpoint);
    expect(deltaBefore.consoleMessages).toHaveLength(0);

    mockSession.emit('Console.messageAdded', {
      message: { level: 'log', text: 'Step 2' },
    });

    const deltaAfter = listener.getDeltaSince(checkpoint);
    expect(deltaAfter.consoleMessages).toHaveLength(1);
    expect(deltaAfter.consoleMessages[0].text).toBe('Step 2');
  });
});

describe('BrowserRunner & Agent Tools Interface', () => {
  let mockPage: Page;
  let mockSession: MockCDPSession;
  let runner: BrowserRunner;
  const testTraceDir = join(process.cwd(), '.onyx', 'test-traces');

  beforeEach(async () => {
    await resetBrowserRunner();
    mockSession = new MockCDPSession();

    const mockLocator = {
      click: vi.fn().mockResolvedValue(undefined),
      fill: vi.fn().mockResolvedValue(undefined),
      first: () => mockLocator,
    };

    mockPage = {
      setDefaultTimeout: vi.fn(),
      setDefaultNavigationTimeout: vi.fn(),
      goto: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValue({
        role: 'document',
        name: 'Onyx Enterprise App',
        children: [
          { role: 'button', name: 'Submit Query', children: [] },
          { role: 'textbox', name: 'User Email', children: [] },
        ],
      }),
      getByRole: vi.fn().mockReturnValue(mockLocator),
      getByLabel: vi.fn().mockReturnValue(mockLocator),
      getByText: vi.fn().mockReturnValue(mockLocator),
      locator: vi.fn().mockReturnValue(mockLocator),
      context: () => ({
        newCDPSession: async () => mockSession,
        tracing: {
          start: vi.fn().mockResolvedValue(undefined),
          stop: vi.fn().mockResolvedValue(undefined),
        },
        close: vi.fn().mockResolvedValue(undefined),
      }),
    } as unknown as Page;

    runner = new BrowserRunner({ headless: true, timeoutMs: 8000, traceArtifactDir: testTraceDir });
    await runner.init(mockPage, mockSession);
  });

  it('navigates and extracts accessibility tree structure', async () => {
    const a11yTree = await runner.navigate('https://app.oynx.si/demo');
    expect(a11yTree.role).toBe('document');
    expect(a11yTree.children).toHaveLength(2);
    expect(runner.getActionsHistory()).toHaveLength(1);
    expect(runner.getActionsHistory()[0].action).toBe('navigate');
  });

  it('resolves accessibility role and executes click interaction', async () => {
    const action = await runner.interact("role=button[name='Submit Query']", 'click');
    expect(action.action).toBe('click');
    expect(action.target).toBe("role=button[name='Submit Query']");
    expect(mockPage.getByRole).toHaveBeenCalledWith('button', { name: 'Submit Query' });
  });

  it('resolves accessibility label and executes fill interaction', async () => {
    const action = await runner.interact("label='User Email'", 'fill', 'cto@enterprise.com');
    expect(action.action).toBe('fill');
    expect(action.value).toBe('cto@enterprise.com');
    expect(mockPage.getByLabel).toHaveBeenCalledWith('User Email');
  });

  it('exports action history into an executable @playwright/test file', async () => {
    await runner.navigate('https://app.oynx.si/login');
    await runner.interact("label='Email'", 'fill', 'admin@corp.io');
    await runner.interact("role=button[name='Sign In']", 'click');

    const targetSpecPath = join(process.cwd(), '.onyx', 'generated-tests', 'recorded.spec.ts');
    const specCode = await runner.exportSpec(targetSpecPath);

    expect(specCode).toContain(`import { test, expect } from '@playwright/test';`);
    expect(specCode).toContain(`await page.goto('https://app.oynx.si/login'`);
    expect(specCode).toContain(`fill('admin@corp.io')`);
    expect(specCode).toContain(`click()`);

    const fileContent = await readFile(targetSpecPath, 'utf-8');
    expect(fileContent).toBe(specCode);

    // Clean up
    await rm(join(process.cwd(), '.onyx', 'generated-tests'), { recursive: true, force: true });
  });

  it('verifies exposed agent tool definitions comply with schema', () => {
    const names = browserToolDefinitions.map((t) => t.name);
    expect(names).toEqual([
      'browser_navigate',
      'browser_interact',
      'browser_capture_trace',
      'browser_export_spec',
    ]);
  });
});
