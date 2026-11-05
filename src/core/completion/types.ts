export interface CursorPosition {
  line: number;
  column: number;
}

export interface CompletionContextWindow {
  prefixLines: string[];
  suffixLines: string[];
  activeLineText: string;
  scopeIdentifiers: string[];
}

export interface GhostTextProposal {
  completionText: string;
  latencyMs: number;
  isValidSyntax: boolean;
  acceptedWordsCount: number;
}
