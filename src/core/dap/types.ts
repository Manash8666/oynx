export interface SourceBreakpoint {
  line: number;
  column?: number;
  condition?: string;
  hitCondition?: string;
  verified?: boolean;
}

export interface BreakpointRecord {
  id: string;
  filePath: string;
  line: number;
  condition?: string;
  hitCondition?: string;
  verified: boolean;
}

export interface StackFrame {
  id: number;
  name: string;
  filePath: string;
  line: number;
  column: number;
}

export interface Scope {
  name: string; // 'Local' | 'Closure' | 'Global'
  variablesReference: number;
  expensive: boolean;
}

export interface Variable {
  name: string;
  value: string;
  type?: string;
  variablesReference: number;
}

export interface DebugSessionState {
  sessionId: string;
  status: 'INITIALIZING' | 'RUNNING' | 'STOPPED' | 'TERMINATED';
  currentFrame?: StackFrame;
  stopReason?: string;
}
