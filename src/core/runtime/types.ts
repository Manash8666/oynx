export interface HeapDeltaSummary {
  failingInstruction: string;
  rootCause: string;
  line: number;
  scopeHeap: Record<string, unknown>;
  tokenEstimate: number;
}

export interface ShadowVmExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  error?: string;
  heapDelta?: HeapDeltaSummary;
}
