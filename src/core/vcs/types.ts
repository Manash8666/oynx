export interface WorktreeConfig {
  taskId: string;
  repoRoot: string;
  sandboxBaseDir?: string; // Default: .onyx/sandboxes
  maxStorageBytes?: number; // Default: 2GB (2 * 1024 * 1024 * 1024)
}

export interface ShadowWorktree {
  taskId: string;
  branchName: string;
  worktreePath: string;
  createdAt: number;
  isActive: boolean;
  diskUsageBytes: number;
}

export interface ThreeWayDiffEntry {
  filePath: string;
  status: 'added' | 'modified' | 'deleted' | 'conflict';
  baseContent?: string;
  hostContent?: string;
  shadowContent?: string;
  hasUserConflict: boolean;
}

export interface MergeProposal {
  taskId: string;
  sourceBranch: string;
  targetBranch: string;
  files: ThreeWayDiffEntry[];
  canFastForward: boolean;
  cherryPickCommitSha?: string;
}
