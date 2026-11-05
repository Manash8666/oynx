export type AutoSaveMode = 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange';

export interface DocumentDirtyState {
  filePath: string;
  isDirty: boolean;
  currentVersionId: number;
  lastSavedVersionId: number;
}

export interface SaveParticipantOptions {
  formatOnSave?: boolean;
  organizeImports?: boolean;
  trimTrailingWhitespace?: boolean;
  insertFinalNewline?: boolean;
  timeoutMs?: number;
}

export interface SavePipelineResult {
  filePath: string;
  success: boolean;
  savedVersionId: number;
  participantsExecuted: string[];
  error?: string;
}
