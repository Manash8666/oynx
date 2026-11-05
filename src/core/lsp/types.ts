export type DiagnosticSeverity = 1 | 2 | 3 | 4; // 1: Error, 2: Warning, 3: Information, 4: Hint

export interface Range {
  start: { line: number; character: number };
  end: { line: number; character: number };
}

export interface Diagnostic {
  range: Range;
  severity: DiagnosticSeverity;
  code?: string | number;
  source?: string;
  message: string;
}

export interface PublishDiagnosticsParams {
  uri: string;
  version?: number;
  diagnostics: Diagnostic[];
}

export interface LspErrorSummary {
  filePath: string;
  line: number;
  column: number;
  code?: string | number;
  message: string;
  snippet?: string;
}

export interface HealingPassResult {
  passNumber: number;
  errorsDetected: LspErrorSummary[];
  remediationPrompt?: string;
  healed: boolean;
  escalatedToUser: boolean;
}
