export interface FileSnapshot {
  filePath: string;
  content: string; // or compressed delta
  hash: string;
  isNew: boolean;
}

export interface Checkpoint {
  id: string;
  timestamp: number;
  agentTurnId: string;
  userPrompt: string;
  gitHeadCommit?: string;
  touchedFiles: string[];
  createdFiles: string[];
  snapshots: Map<string, FileSnapshot>;
}

export interface TimelineTurn {
  turnId: string;
  checkpointId: string;
  prompt: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVERTED';
  timestamp: number;
  filesChanged: number;
}
