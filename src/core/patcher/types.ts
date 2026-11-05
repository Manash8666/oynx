export type PatchType = 'unified' | 'search_replace' | 'whole_file' | 'ast_splice';

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

export interface PatchOperation {
  filePath: string;
  type: PatchType;
  hunks?: DiffHunk[];
  searchBlock?: string;
  replaceBlock?: string;
  wholeContent?: string;
  targetSymbol?: string;
}

export interface FuzzyMatchResult {
  matched: boolean;
  startLine: number;
  endLine: number;
  confidence: number;
  matchedText: string;
}

export interface PatchApplyResult {
  filePath: string;
  success: boolean;
  appliedType: PatchType;
  error?: string;
  originalContent: string;
  patchedContent: string;
}

export interface MultiFilePatchResult {
  success: boolean;
  appliedFiles: string[];
  results: Map<string, PatchApplyResult>;
  aborted: boolean;
  abortReason?: string;
}
