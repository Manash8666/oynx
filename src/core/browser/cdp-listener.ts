import type { CDPSession, Page } from 'playwright';
import type {
  ConsoleMessageRecord,
  ExceptionRecord,
  ExecutionTelemetry,
  NetworkFailureRecord,
} from './types.js';

export interface CDPSessionLike {
  send(method: string, params?: Record<string, unknown>): Promise<unknown>;
  on(event: string, listener: (...args: unknown[]) => void): void;
  off(event: string, listener: (...args: unknown[]) => void): void;
  detach(): Promise<void>;
}

export class CDPListener {
  private session: CDPSessionLike | null = null;
  private consoleMessages: ConsoleMessageRecord[] = [];
  private networkFailures: NetworkFailureRecord[] = [];
  private uncaughtExceptions: ExceptionRecord[] = [];
  private isListening = false;

  constructor(private readonly page: Page, sessionOverride?: CDPSessionLike) {
    if (sessionOverride) {
      this.session = sessionOverride;
    }
  }

  public async start(): Promise<void> {
    if (this.isListening) return;

    if (!this.session) {
      this.session = await this.page.context().newCDPSession(this.page);
    }

    // Enable CDP Domains
    await this.session.send('Runtime.enable');
    await this.session.send('Console.enable');
    await this.session.send('Network.enable');

    // Attach listeners
    this.session.on('Runtime.exceptionThrown', this.handleExceptionThrown);
    this.session.on('Console.messageAdded', this.handleConsoleMessageAdded);
    this.session.on('Network.responseReceived', this.handleNetworkResponseReceived);

    this.isListening = true;
  }

  public async stop(): Promise<void> {
    if (!this.isListening || !this.session) return;

    this.session.off('Runtime.exceptionThrown', this.handleExceptionThrown);
    this.session.off('Console.messageAdded', this.handleConsoleMessageAdded);
    this.session.off('Network.responseReceived', this.handleNetworkResponseReceived);

    try {
      await this.session.detach();
    } catch {
      // Ignored if session was already closed
    }

    this.isListening = false;
  }

  private handleExceptionThrown = (eventData: unknown): void => {
    const payload = eventData as {
      exceptionDetails?: {
        text?: string;
        exception?: { description?: string; value?: unknown };
        stackTrace?: {
          callFrames?: Array<{
            functionName?: string;
            url?: string;
            lineNumber?: number;
            columnNumber?: number;
          }>;
        };
      };
    };

    const details = payload.exceptionDetails;
    const message =
      details?.exception?.description ||
      details?.text ||
      'Unknown uncaught exception in browser runtime';

    const stackFrames = details?.stackTrace?.callFrames || [];
    const formattedStack = stackFrames
      .map(
        (f) =>
          `    at ${f.functionName || '<anonymous>'} (${f.url || 'eval'}:${f.lineNumber ?? 0}:${f.columnNumber ?? 0})`
      )
      .join('\n');

    this.uncaughtExceptions.push({
      message,
      stack: formattedStack || undefined,
      timestamp: Date.now(),
    });
  };

  private handleConsoleMessageAdded = (eventData: unknown): void => {
    const payload = eventData as {
      message?: {
        level?: string;
        text?: string;
        url?: string;
        line?: number;
        column?: number;
      };
    };

    const msg = payload.message;
    if (!msg) return;

    this.consoleMessages.push({
      type: msg.level || 'log',
      text: msg.text || '',
      location: {
        url: msg.url,
        lineNumber: msg.line,
        columnNumber: msg.column,
      },
      timestamp: Date.now(),
    });
  };

  private handleNetworkResponseReceived = (eventData: unknown): void => {
    const payload = eventData as {
      response?: {
        url?: string;
        status?: number;
        statusText?: string;
        headers?: Record<string, string>;
      };
      type?: string;
    };

    const res = payload.response;
    if (!res || typeof res.status !== 'number') return;

    // Filter and trap 4xx and 5xx HTTP responses
    if (res.status >= 400) {
      this.networkFailures.push({
        url: res.url || 'unknown-url',
        status: res.status,
        statusText: res.statusText || `${res.status} Error`,
        method: 'RESPONSE',
        timestamp: Date.now(),
      });
    }
  };

  public getTelemetry(): ExecutionTelemetry {
    return {
      consoleMessages: [...this.consoleMessages],
      networkFailures: [...this.networkFailures],
      uncaughtExceptions: [...this.uncaughtExceptions],
      timestamp: Date.now(),
    };
  }

  public getDeltaSince(lastTimestamp: number): ExecutionTelemetry {
    return {
      consoleMessages: this.consoleMessages.filter((m) => m.timestamp >= lastTimestamp),
      networkFailures: this.networkFailures.filter((n) => n.timestamp >= lastTimestamp),
      uncaughtExceptions: this.uncaughtExceptions.filter((e) => e.timestamp >= lastTimestamp),
      timestamp: Date.now(),
    };
  }

  public clear(): void {
    this.consoleMessages = [];
    this.networkFailures = [];
    this.uncaughtExceptions = [];
  }
}
