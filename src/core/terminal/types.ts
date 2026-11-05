export interface ProcessSpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
  idleTimeoutMs?: number; // default: 30,000ms
  maxBufferLines?: number; // default: 50,000 lines
  shell?: string | boolean;
}

export interface TerminalChunkEvent {
  rawAnsi: string;
  cleanText: string;
  timestamp: number;
}

export interface InteractiveTrapDetection {
  promptText: string;
  matchedPattern: string;
  suggestedAnswer: string;
  line: number;
}

export interface TerminalExecutionResult {
  command: string;
  pid?: number;
  exitCode: number;
  stdout: string;
  stderr: string;
  rawAnsi: string;
  timedOut: boolean;
  interactivePromptsDetected: InteractiveTrapDetection[];
}
