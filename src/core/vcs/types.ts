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

export type ScmFileStatus = 'staged' | 'unstaged' | 'untracked' | 'ignored' | 'conflict';

export interface ScmFileEntry {
  path: string;
  status: ScmFileStatus;
  stagedDelta?: 'A' | 'M' | 'D' | 'R' | 'C';
  worktreeDelta?: 'A' | 'M' | 'D' | '?';
}

export interface ScmStatusResult {
  staged: ScmFileEntry[];
  unstaged: ScmFileEntry[];
  untracked: ScmFileEntry[];
  conflicts: ScmFileEntry[];
  totalCount: number;
  isOverflow: boolean;
  statusLimit: number;
  activeBranch: string;
}

export interface ConventionalCommitDraft {
  type: 'feat' | 'fix' | 'refactor' | 'test' | 'docs' | 'chore' | 'perf';
  scope?: string;
  subject: string;
  body?: string;
  breaking: boolean;
  formatted: string;
}

export interface StashSnapshot {
  id: string;
  message: string;
  branch: string;
  createdAt: number;
}

export interface ConflictBlock {
  filePath: string;
  currentBranch: string;
  incomingBranch: string;
  currentCode: string;
  incomingCode: string;
  resolvedCode?: string;
}

