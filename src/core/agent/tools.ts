import { BrowserRunner } from '../browser/runner.js';
import { PtySupervisor } from '../terminal/pty-supervisor.js';
import type {
  AccessibilitySnapshotNode,
  BrowserInteractionAction,
  ExecutionTelemetry,
} from '../browser/types.js';

let sharedRunner: BrowserRunner | null = null;

export async function getBrowserRunner(headless = true): Promise<BrowserRunner> {
  if (!sharedRunner) {
    sharedRunner = new BrowserRunner({ headless, timeoutMs: 8000 });
    await sharedRunner.init();
  }
  return sharedRunner;
}

export async function resetBrowserRunner(): Promise<void> {
  if (sharedRunner) {
    await sharedRunner.close();
    sharedRunner = null;
  }
}

/**
 * Tool: browser_navigate
 * Navigates to a target URL, waits for domcontentloaded, and returns the accessibility snapshot tree.
 */
export async function browser_navigate(url: string): Promise<{
  snapshot: AccessibilitySnapshotNode;
  telemetry: ExecutionTelemetry;
}> {
  const runner = await getBrowserRunner();
  const snapshot = await runner.navigate(url);
  const telemetry = runner.getTelemetry();
  return { snapshot, telemetry };
}

/**
 * Tool: browser_interact
 * Executes DOM interaction (click, fill) resolving via accessibility roles or CSS fallback.
 * Returns action telemetry deltas and auto-timeouts at 8,000ms.
 */
export async function browser_interact(
  selector: string,
  action: 'click' | 'fill',
  value?: string
): Promise<BrowserInteractionAction> {
  const runner = await getBrowserRunner();
  return await runner.interact(selector, action, value);
}

/**
 * Tool: browser_capture_trace
 * Exports an artifact .zip trace view for debugging and replay inspection.
 */
export async function browser_capture_trace(): Promise<{ tracePath: string }> {
  const runner = await getBrowserRunner();
  const tracePath = await runner.captureTrace();
  return { tracePath };
}

/**
 * Tool: browser_export_spec
 * Compiles the recorded action sequence into an executable @playwright/test spec file.
 */
export async function browser_export_spec(targetPath: string): Promise<{
  targetPath: string;
  specCode: string;
}> {
  const runner = await getBrowserRunner();
  const specCode = await runner.exportSpec(targetPath);
  return { targetPath, specCode };
}

export const browserToolDefinitions = [
  {
    name: 'browser_navigate',
    description:
      'Navigates to a target URL, waits for domcontentloaded, and returns accessibility snapshot tree with runtime telemetry.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Destination HTTP/HTTPS or local URL' },
      },
      required: ['url'],
    },
    execute: async (args: { url: string }) => browser_navigate(args.url),
  },
  {
    name: 'browser_interact',
    description:
      'Executes DOM interaction (click, fill) with accessibility role resolution and 8000ms safety timeout.',
    parameters: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'Accessibility role, label, or CSS selector' },
        action: { type: 'string', enum: ['click', 'fill'], description: 'Action to perform' },
        value: { type: 'string', description: 'Text value for fill actions' },
      },
      required: ['selector', 'action'],
    },
    execute: async (args: { selector: string; action: 'click' | 'fill'; value?: string }) =>
      browser_interact(args.selector, args.action, args.value),
  },
  {
    name: 'browser_capture_trace',
    description: 'Exports Playwright trace artifact (.zip) with DOM snapshots, screenshots, and console logs.',
    parameters: {
      type: 'object',
      properties: {},
    },
    execute: async () => browser_capture_trace(),
  },
  {
    name: 'browser_export_spec',
    description:
      'Compiles the recorded action sequence into an executable @playwright/test file at the specified path.',
    parameters: {
      type: 'object',
      properties: {
        targetPath: { type: 'string', description: 'File destination for the generated Playwright test' },
      },
      required: ['targetPath'],
    },
    execute: async (args: { targetPath: string }) => browser_export_spec(args.targetPath),
  },
];

export const terminalToolDefinitions = [
  {
    name: 'terminal_run',
    description: 'Executes a command inside the virtual PTY supervisor with automatic interactive trap handling and ANSI cleaning.',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The shell command to execute' },
        autoRespond: { type: 'boolean', description: 'Automatically answer yes/no and enter prompts' },
      },
      required: ['command'],
    },
    execute: async (args: { command: string; autoRespond?: boolean }) =>
      terminal_run(args.command, args.autoRespond),
  },
];

export const allAgentToolDefinitions = [...browserToolDefinitions, ...terminalToolDefinitions];

let sharedPty: PtySupervisor | null = null;

export function getPtySupervisor(): PtySupervisor {
  if (!sharedPty) {
    sharedPty = new PtySupervisor();
  }
  return sharedPty;
}

export async function terminal_run(command: string, autoRespond = true) {
  const pty = getPtySupervisor();
  return await pty.execute(command, [], { autoRespond });
}
