export type HunkStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CONFLICT';

export interface LineRange {
  startLine: number;
  endLine: number;
}

export interface DiffHunk {
  hunkId: string;
  originalRange: LineRange;
  originalText: string;
  modifiedText: string;
  modifiedLineCount: number;
  status: HunkStatus;
}

export interface StreamingDiffDelta {
  lineIndex: number;
  type: 'addition' | 'deletion' | 'unchanged';
  text: string;
}

export interface DecorationRenderState {
  hunkCount: number;
  pendingCount: number;
  decorations: Array<{
    id: string;
    hunkId: string;
    range: LineRange;
    className: string;
  }>;
}
