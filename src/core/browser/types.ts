export interface ConsoleMessageRecord {
  type: string;
  text: string;
  location?: {
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
  };
  timestamp: number;
}

export interface NetworkFailureRecord {
  url: string;
  status: number;
  statusText: string;
  method: string;
  timestamp: number;
}

export interface ExceptionRecord {
  message: string;
  stack?: string;
  timestamp: number;
}

export interface ExecutionTelemetry {
  consoleMessages: ConsoleMessageRecord[];
  networkFailures: NetworkFailureRecord[];
  uncaughtExceptions: ExceptionRecord[];
  timestamp: number;
}

export interface BrowserInteractionAction {
  action: 'navigate' | 'click' | 'fill';
  target: string;
  value?: string;
  timestamp: number;
  durationMs: number;
  telemetryDelta: ExecutionTelemetry;
}

export interface AccessibilitySnapshotNode {
  role: string;
  name?: string;
  value?: string;
  description?: string;
  children?: AccessibilitySnapshotNode[];
}

export interface BrowserRunnerConfig {
  headless: boolean;
  viewport?: { width: number; height: number };
  timeoutMs?: number;
  traceArtifactDir?: string;
}
