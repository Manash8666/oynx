import { execFile } from 'child_process';
import { promisify } from 'util';
import { resolve, relative, normalize } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { TreeSitterParser } from '../ast/tree-sitter-parser.js';
import type {
  ScmStatusResult,
  ScmFileEntry,
  ConventionalCommitDraft,
  StashSnapshot,
  ConflictBlock,
} from './types.js';

const execFileAsync = promisify(execFile);

export interface GitScmOptions {
  repoRoot?: string;
  statusLimit?: number;
  untrackedSeparate?: boolean;
}

export class GitScmService {
  private repoRoot: string;
  private statusLimit: number;
  private untrackedSeparate: boolean;
  private parser: TreeSitterParser;

  constructor(options: GitScmOptions = {}) {
    this.repoRoot = normalize(resolve(options.repoRoot || process.cwd()));
    this.statusLimit = options.statusLimit || 20000;
    this.untrackedSeparate = options.untrackedSeparate ?? true;
    this.parser = new TreeSitterParser();
  }

  /**
   * Run git command within repoRoot
   */
  private async execGit(args: string[], input?: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((res, rej) => {
      const child = execFile('git', args, { cwd: this.repoRoot, maxBuffer: 32 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          rej(new Error(`Git command failed: git ${args.join(' ')}\n${stderr || err.message}`));
        } else {
          res({ stdout: stdout.toString(), stderr: stderr.toString() });
        }
      });

      if (input && child.stdin) {
        child.stdin.write(input);
        child.stdin.end();
      }
    });
  }

  /**
   * Get SCM Status with safety limit to prevent status overflow
   */
  public async getStatus(options?: { statusLimit?: number }): Promise<ScmStatusResult> {
    const limit = options?.statusLimit || this.statusLimit;

    // Get current branch
    let activeBranch = 'HEAD';
    try {
      const branchRes = await this.execGit(['branch', '--show-current']);
      activeBranch = branchRes.stdout.trim() || 'HEAD';
    } catch {
      // Fallback if detached or fresh
    }

    // Get status porcelain
    const { stdout } = await this.execGit(['status', '--porcelain=v1', '-uall']);
    const lines = stdout.split(/\r?\n/).filter((l) => l.length > 0);

    const staged: ScmFileEntry[] = [];
    const unstaged: ScmFileEntry[] = [];
    const untracked: ScmFileEntry[] = [];
    const conflicts: ScmFileEntry[] = [];

    const totalCount = lines.length;
    const isOverflow = totalCount > limit;
    const processLines = isOverflow ? lines.slice(0, limit) : lines;

    for (const line of processLines) {
      if (line.length < 3) continue;
      const x = line[0];
      const y = line[1];
      const filePath = line.substring(3).trim().replace(/^"|"$/g, '');

      // Check conflict
      if (x === 'U' || y === 'U' || (x === 'A' && y === 'A') || (x === 'D' && y === 'D')) {
        conflicts.push({ path: filePath, status: 'conflict' });
        continue;
      }

      // Untracked
      if (x === '?' && y === '?') {
        untracked.push({ path: filePath, status: 'untracked', worktreeDelta: '?' });
        continue;
      }

      // Staged
      if (x !== ' ' && x !== '?') {
        staged.push({
          path: filePath,
          status: 'staged',
          stagedDelta: x as 'A' | 'M' | 'D' | 'R' | 'C',
        });
      }

      // Unstaged / modified in worktree
      if (y !== ' ' && y !== '?') {
        unstaged.push({
          path: filePath,
          status: 'unstaged',
          worktreeDelta: y as 'A' | 'M' | 'D',
        });
      }
    }

    return {
      staged,
      unstaged,
      untracked,
      conflicts,
      totalCount,
      isOverflow,
      statusLimit: limit,
      activeBranch,
    };
  }

  /**
   * Stage whole file
   */
  public async stageFile(filePath: string): Promise<void> {
    await this.execGit(['add', filePath]);
  }

  /**
   * Unstage whole file
   */
  public async unstageFile(filePath: string): Promise<void> {
    await this.execGit(['restore', '--staged', filePath]);
  }

  /**
   * Stage an individual hunk atomically using a temporary patch file
   */
  public async stageHunk(
    filePath: string,
    hunk: {
      originalRange: { startLine: number; endLine?: number };
      originalText: string;
      modifiedText: string;
    }
  ): Promise<void> {
    const patch = this.buildHunkPatch(filePath, hunk);
    const tempPatchPath = resolve(tmpdir(), `onyx_stage_${Date.now()}_${Math.random().toString(36).substring(7)}.patch`);

    writeFileSync(tempPatchPath, patch, 'utf-8');
    try {
      await this.execGit(['apply', '--cached', '--unidiff-zero', tempPatchPath]);
    } finally {
      try {
        unlinkSync(tempPatchPath);
      } catch {
        // ignore cleanup error
      }
    }
  }

  /**
   * Unstage an individual hunk atomically using a reverse patch
   */
  public async unstageHunk(
    filePath: string,
    hunk: {
      originalRange: { startLine: number; endLine?: number };
      originalText: string;
      modifiedText: string;
    }
  ): Promise<void> {
    const patch = this.buildHunkPatch(filePath, hunk);
    const tempPatchPath = resolve(tmpdir(), `onyx_unstage_${Date.now()}_${Math.random().toString(36).substring(7)}.patch`);

    writeFileSync(tempPatchPath, patch, 'utf-8');
    try {
      await this.execGit(['apply', '--cached', '--reverse', '--unidiff-zero', tempPatchPath]);
    } finally {
      try {
        unlinkSync(tempPatchPath);
      } catch {
        // ignore cleanup error
      }
    }
  }

  /**
   * Construct standard unified diff patch for a single hunk
   */
  private buildHunkPatch(
    filePath: string,
    hunk: {
      originalRange: { startLine: number; endLine?: number };
      originalText: string;
      modifiedText: string;
    }
  ): string {
    const rel = relative(this.repoRoot, resolve(this.repoRoot, filePath)).replace(/\\/g, '/');
    const origLines = hunk.originalText ? hunk.originalText.split(/\r?\n/) : [];
    const modLines = hunk.modifiedText ? hunk.modifiedText.split(/\r?\n/) : [];

    const origCount = origLines.length;
    const modCount = modLines.length;
    const startLine = Math.max(1, hunk.originalRange.startLine);

    let diffLines = '';
    for (const l of origLines) {
      diffLines += `-${l}\n`;
    }
    for (const l of modLines) {
      diffLines += `+${l}\n`;
    }

    return `--- a/${rel}
+++ b/${rel}
@@ -${startLine},${origCount} +${startLine},${modCount} @@
${diffLines}`;
  }

  /**
   * Generate an intelligent Conventional Commit message based on staged diff and modified AST
   */
  public async generateConventionalCommit(providedDiff?: string): Promise<ConventionalCommitDraft> {
    let diff = providedDiff;
    if (diff === undefined) {
      const res = await this.execGit(['diff', '--cached']);
      diff = res.stdout;
    }

    const status = await this.getStatus();
    let files = status.staged.map((s) => s.path);

    if (files.length === 0 && diff) {
      const diffFiles = Array.from(diff.matchAll(/diff --git a\/(\S+) b\/(\S+)/g)).map((m) => m[2]);
      if (diffFiles.length > 0) {
        files = diffFiles;
      }
    }

    if (files.length === 0 && (!diff || diff.trim().length === 0)) {
      return {
        type: 'chore',
        subject: 'update repository working files',
        breaking: false,
        formatted: 'chore: update repository working files',
      };
    }

    // Determine scope
    let scope: string | undefined;
    const firstFile = files[0] || '';
    const parts = firstFile.replace(/\\/g, '/').split('/');
    if (parts.length > 1) {
      scope = parts[1] === 'core' || parts[1] === 'ui' ? parts[2] || parts[1] : parts[0];
      if (scope?.includes('.')) scope = scope.split('.')[0];
    }

    // Determine type
    let type: ConventionalCommitDraft['type'] = 'feat';
    const isOnlyTests = files.length > 0 && files.every((f) => f.includes('test') || f.includes('spec'));
    const isOnlyDocs = files.length > 0 && files.every((f) => f.endsWith('.md') || f.startsWith('docs/'));
    const isOnlyConfigs = files.length > 0 && files.every((f) => f.endsWith('.json') || f.endsWith('.yml') || f.includes('.gitignore'));

    if (isOnlyTests) {
      type = 'test';
    } else if (isOnlyDocs) {
      type = 'docs';
    } else if (isOnlyConfigs) {
      type = 'chore';
    } else if (/error|exception|fail|bug|issue|typo|revert|fix/i.test(diff)) {
      type = 'fix';
    } else if (/perf|optimize|throughput|latency|cache/i.test(diff)) {
      type = 'perf';
    } else if (/refactor|rename|extract|clean/i.test(diff) && !/export\s+(function|class|interface)/i.test(diff)) {
      type = 'refactor';
    } else {
      type = 'feat';
    }

    // Determine Subject
    let subject = '';
    if (type === 'test') {
      subject = `add and verify test suites for ${scope || 'core functionality'}`;
    } else if (type === 'docs') {
      subject = `update documentation and specification guides`;
    } else if (type === 'chore') {
      subject = `update workspace build and project dependencies`;
    } else if (type === 'fix') {
      subject = `resolve defect and enhance error handling in ${scope || 'subsystem'}`;
    } else {
      subject = `implement ${scope || 'module'} features and integrations`;
    }

    const formatted = scope ? `${type}(${scope}): ${subject}` : `${type}: ${subject}`;

    return {
      type,
      scope,
      subject,
      breaking: false,
      formatted,
    };
  }

  /**
   * Commit staged changes
   */
  public async commit(message: string): Promise<string> {
    const { stdout } = await this.execGit(['commit', '-m', message]);
    return stdout;
  }

  /**
   * Create a safe stash snapshot before speculative agent actions
   */
  public async createStashSnapshot(description = 'onyx-agent-snapshot'): Promise<StashSnapshot> {
    const status = await this.getStatus();
    const branch = status.activeBranch;

    // Use git stash create to generate a dangling commit SHA without wiping working tree
    const createRes = await this.execGit(['stash', 'create']);
    let stashSha = createRes.stdout.trim();

    if (!stashSha) {
      // If working tree was clean, get current HEAD commit SHA
      const headRes = await this.execGit(['rev-parse', 'HEAD']);
      stashSha = headRes.stdout.trim();
    }

    return {
      id: stashSha,
      message: description,
      branch,
      createdAt: Date.now(),
    };
  }

  /**
   * Branch switching & creation
   */
  public async switchBranch(branchName: string, createNew = false): Promise<void> {
    if (createNew) {
      await this.execGit(['checkout', '-b', branchName]);
    } else {
      await this.execGit(['checkout', branchName]);
    }
  }

  /**
   * Rollback working tree or reset to commit checkpoint
   */
  public async revertToCheckpoint(commitSha: string, hard = false): Promise<void> {
    if (hard) {
      await this.execGit(['reset', '--hard', commitSha]);
    } else {
      await this.execGit(['reset', commitSha]);
    }
  }

  /**
   * Onyx Agent AST Conflict Resolver
   * Inspects conflicting code blocks, evaluates AST nodes from both branches,
   * and proposes an auto-resolved unified block without conflict markers.
   */
  public resolveConflictWithAST(
    filePath: string,
    conflict: ConflictBlock
  ): { resolvedCode: string; mergedSymbols: string[]; autoResolved: boolean } {
    const currentParsed = this.parser.parse(filePath, conflict.currentCode);
    const incomingParsed = this.parser.parse(filePath, conflict.incomingCode);

    const mergedSymbols: string[] = [];
    const currentLines = conflict.currentCode.split(/\r?\n/);
    const incomingLines = conflict.incomingCode.split(/\r?\n/);

    // Collect all imports from both sides
    const currentImports = currentLines.filter((l) => /^\s*import\s+/i.test(l));
    const incomingImports = incomingLines.filter((l) => /^\s*import\s+/i.test(l));
    const uniqueImports = Array.from(new Set([...currentImports, ...incomingImports]));

    // Check if one side is purely imports and the other side is code
    const currentHasCodeOnly = currentLines.some((l) => !/^\s*import\s+/i.test(l) && l.trim().length > 0);
    const incomingHasCodeOnly = incomingLines.some((l) => !/^\s*import\s+/i.test(l) && l.trim().length > 0);

    let resolvedCode = '';

    // If both modified functions with disjoint names, merge both symbol bodies!
    const currentSymbolNames = currentParsed.symbols.map((s) => s.name);
    const incomingSymbolNames = incomingParsed.symbols.map((s) => s.name);
    const disjointIncoming = incomingParsed.symbols.filter((s) => !currentSymbolNames.includes(s.name));

    if (disjointIncoming.length > 0) {
      // Disjoint symbols: keep all current code and append incoming new symbols!
      const nonImportIncomingLines = incomingLines.filter((l) => !/^\s*import\s+/i.test(l));
      resolvedCode = [...uniqueImports, ...currentLines.filter((l) => !/^\s*import\s+/i.test(l)), ...nonImportIncomingLines].join('\n');
      mergedSymbols.push(...currentSymbolNames, ...disjointIncoming.map((s) => s.name));
      return { resolvedCode, mergedSymbols, autoResolved: true };
    }

    // If both touched same symbol name, take incoming version with current imports preserved
    resolvedCode = [...uniqueImports, ...incomingLines.filter((l) => !/^\s*import\s+/i.test(l))].join('\n');
    mergedSymbols.push(...incomingSymbolNames);

    return {
      resolvedCode,
      mergedSymbols,
      autoResolved: true,
    };
  }
}
