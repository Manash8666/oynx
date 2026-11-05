import { resolve, normalize, relative } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { WorktreeManager } from '../vcs/worktree-manager.js';
import type { ShadowWorktree } from '../vcs/types.js';

const execFileAsync = promisify(execFile);

export type AgentStatus = 'INITIALIZING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ABORTED';

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
