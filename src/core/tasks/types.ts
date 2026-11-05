export type ProblemSeverity = 'error' | 'warning' | 'info';

export interface ExtractedProblem {
  filePath: string;
  line: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  severity: ProblemSeverity;
  code?: string;
  message: string;
  source?: string;
}

export interface ProblemMatcherPattern {
  regexp: RegExp;
  file: number;
  line: number;
  column?: number;
  severity?: number;
  code?: number;
  message: number;
  loop?: boolean;
}

export interface ProblemMatcherDefinition {
  name: string;
  owner?: string;
  patterns: ProblemMatcherPattern[];
  background?: {
    beginsPattern: RegExp;
    endsPattern: RegExp;
  };
}

export interface OnyxTaskConfig {
  label: string;
  type: string;
  command: string;
  args?: string[];
  isBackground?: boolean;
  problemMatcher?: string | ProblemMatcherDefinition;
  dependsOn?: string[];
  cwd?: string;
}
