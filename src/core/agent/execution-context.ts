import { resolve, normalize, relative } from 'path';
import { existsSync, readFileSync, appendFileSync, writeFileSync } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { WorktreeManager } from '../vcs/worktree-manager.js';
import type { ShadowWorktree } from '../vcs/types.js';

const execFileAsync = promisify(execFile);

export type AgentStatus = 'INITIALIZING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ABORTED';

export const REPOSITORY_CLEANLINESS_RULE = `
Rule: Repository Cleanliness & Git Invariant Gate
1. Before running package installations or build commands (npm install, cargo build, etc.), verify that a root .gitignore exists and explicitly excludes dependency directories, build targets, and cache files.
2. If an operation produces more than 50 new files that are not part of the active user task (e.g., downloaded models, compiled outputs, local logs), immediately append those patterns to .gitignore before reporting task completion.
`.trim();

export class AgentExecutionContext {
  public readonly taskId: string;
  private worktreeManager: WorktreeManager;
  private shadowWorktree?: ShadowWorktree;
  private status: AgentStatus = 'INITIALIZING';

  constructor(taskId: string, worktreeManager: WorktreeManager) {
    this.taskId = taskId;
    this.worktreeManager = worktreeManager;
  }

  public async initialize(): Promise<ShadowWorktree> {
    this.shadowWorktree = await this.worktreeManager.createShadowWorktree(this.taskId);
    this.status = 'RUNNING';
    return this.shadowWorktree;
  }

  /**
   * Rule 1 Gate: Verify root .gitignore exists and excludes dependency/build dirs
   */
  public verifyPreFlightGitIgnore(targetDir?: string): { valid: boolean; created: boolean; updated: boolean } {
    const root = targetDir || (this.shadowWorktree ? this.getWorkingDirectory() : process.cwd());
    const gitignorePath = resolve(root, '.gitignore');
    const essentialPatterns = [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      '.turbo/',
      'out/',
      'coverage/',
      '.onyx/sandboxes/',
      '*.log',
    ];

    if (!existsSync(gitignorePath)) {
      writeFileSync(gitignorePath, essentialPatterns.join('\n') + '\n', 'utf-8');
      return { valid: true, created: true, updated: false };
    }

    const content = readFileSync(gitignorePath, 'utf-8');
    const missing = essentialPatterns.filter((p) => !content.includes(p));

    if (missing.length > 0) {
      appendFileSync(gitignorePath, '\n# Onyx Automated Safety Exclusions\n' + missing.join('\n') + '\n', 'utf-8');
      return { valid: true, created: false, updated: true };
    }

    return { valid: true, created: false, updated: false };
  }

  /**
   * Rule 2 Gate: If an operation produces more than 50 untracked files,
   * immediately append those directory patterns to .gitignore to prevent SCM status overflow.
   */
  public async enforceUntrackedFileGate(
    maxAllowedUntracked = 50,
    targetDir?: string
  ): Promise<{ triggered: boolean; autoAppendedPatterns: string[]; untrackedCount: number }> {
    const root = targetDir || (this.shadowWorktree ? this.getWorkingDirectory() : process.cwd());
    const gitignorePath = resolve(root, '.gitignore');

    try {
      const { stdout } = await execFileAsync('git', ['status', '--porcelain=v1', '-uall'], { cwd: root });
      const untrackedFiles = stdout
        .split(/\r?\n/)
        .filter((l) => l.startsWith('??'))
        .map((l) => l.substring(3).trim());

      const untrackedCount = untrackedFiles.length;
      if (untrackedCount <= maxAllowedUntracked) {
        return { triggered: false, autoAppendedPatterns: [], untrackedCount };
      }

      // Group into top-level subdirectories or file extensions
      const dirCounts = new Map<string, number>();
      for (const file of untrackedFiles) {
        const parts = file.split(/[/\\]/);
        if (parts.length > 1) {
          const topDir = parts[0] + '/';
          dirCounts.set(topDir, (dirCounts.get(topDir) || 0) + 1);
        }
      }

      const patternsToAppend: string[] = [];
      for (const [dir, count] of dirCounts.entries()) {
        if (count >= 10) {
          patternsToAppend.push(dir);
        }
      }

      if (patternsToAppend.length > 0) {
        const currentGitignore = existsSync(gitignorePath) ? readFileSync(gitignorePath, 'utf-8') : '';
        const newPatterns = patternsToAppend.filter((p) => !currentGitignore.includes(p));
        if (newPatterns.length > 0) {
          appendFileSync(
            gitignorePath,
            `\n# Auto-appended by Onyx Untracked Files Safety Gate (> ${maxAllowedUntracked} files)\n` +
              newPatterns.join('\n') +
              '\n',
            'utf-8'
          );
        }
        return { triggered: true, autoAppendedPatterns: newPatterns, untrackedCount };
      }

      return { triggered: true, autoAppendedPatterns: [], untrackedCount };
    } catch {
      return { triggered: false, autoAppendedPatterns: [], untrackedCount: 0 };
    }
  }

  public getStatus(): AgentStatus {
    return this.status;
  }

  public getWorkingDirectory(): string {
    if (!this.shadowWorktree) {
      throw new Error('Agent execution context not initialized');
    }
    return this.shadowWorktree.worktreePath;
  }

  /**
   * Resolve and enforce that all agent file writes stay strictly within the shadow sandbox.
   */
  public resolveSandboxPath(relativePath: string): string {
    const root = this.getWorkingDirectory();
    const resolved = normalize(resolve(root, relativePath));

    const rel = relative(root, resolved);
    if (rel.startsWith('..') || resolve(resolved) === resolve(root, '..')) {
      throw new Error(`SECURITY_BOUNDARY_VIOLATION: Attempted access outside shadow sandbox: ${relativePath}`);
    }

    return resolved;
  }

  /**
   * Execute command routed strictly within the shadow sandbox.
   */
  public async executeCommand(
    command: string,
    args: string[] = []
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    if (this.status !== 'RUNNING') {
      throw new Error(`Cannot execute command: Agent execution context is in state '${this.status}'`);
    }

    const cwd = this.getWorkingDirectory();

    // Check disk usage before execution
    const currentSize = this.worktreeManager.calculateDirectorySize(cwd);
    if (currentSize > 2 * 1024 * 1024 * 1024) {
      this.status = 'ABORTED';
      throw new Error(`STORAGE_QUOTA_EXCEEDED: Shadow worktree exceeds 2GB limit (${currentSize} bytes)`);
    }

    try {
      const res = await execFileAsync(command, args, { cwd });
      return {
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: 0,
      };
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string; code?: number };
      return {
        stdout: execErr.stdout || '',
        stderr: execErr.stderr || String(err),
        exitCode: execErr.code ?? 1,
      };
    }
  }

  public async teardown(success = true): Promise<void> {
    this.status = success ? 'COMPLETED' : 'FAILED';
    await this.worktreeManager.cleanupShadowWorktree(this.taskId);
  }
}
