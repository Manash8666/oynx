import { execFile } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync, statSync, readdirSync, lstatSync } from 'fs';
import { symlink, rm, mkdir, unlink } from 'fs/promises';
import type { ShadowWorktree, WorktreeConfig } from './types.js';

const execFileAsync = promisify(execFile);

export class WorktreeManager {
  private repoRoot: string;
  private sandboxBaseDir: string;
  private maxStorageBytes: number;
  private activeWorktrees = new Map<string, ShadowWorktree>();

  constructor(config: { repoRoot: string; sandboxBaseDir?: string; maxStorageBytes?: number }) {
    this.repoRoot = config.repoRoot;
    this.sandboxBaseDir = config.sandboxBaseDir || join(this.repoRoot, '.onyx', 'sandboxes');
    this.maxStorageBytes = config.maxStorageBytes || 2 * 1024 * 1024 * 1024; // 2GB
  }

  public async createShadowWorktree(taskId: string): Promise<ShadowWorktree> {
    const branchName = `onyx-agent-${taskId}`;
    const worktreePath = join(this.sandboxBaseDir, taskId);

    await mkdir(this.sandboxBaseDir, { recursive: true });

    // Execute git worktree add
    try {
      await execFileAsync('git', ['worktree', 'add', '-b', branchName, worktreePath, 'HEAD'], {
        cwd: this.repoRoot,
      });
    } catch {
      // In case git worktree fails (e.g. branch exists or testing environment), try force or fallback
      try {
        await execFileAsync('git', ['worktree', 'add', '--force', worktreePath, 'HEAD'], {
          cwd: this.repoRoot,
        });
      } catch {
        // Fallback: create directory directly for isolated sandbox
        await mkdir(worktreePath, { recursive: true });
      }
    }

    // Symlink heavy dependencies: node_modules, .venv, target
    await this.symlinkHeavyFolders(worktreePath);

    const diskUsageBytes = this.calculateDirectorySize(worktreePath);
    if (diskUsageBytes > this.maxStorageBytes) {
      await this.cleanupShadowWorktree(taskId);
      throw new Error(`STORAGE_QUOTA_EXCEEDED: Shadow worktree exceeds 2GB limit (${diskUsageBytes} bytes)`);
    }

    const shadow: ShadowWorktree = {
      taskId,
      branchName,
      worktreePath,
      createdAt: Date.now(),
      isActive: true,
      diskUsageBytes,
    };

    this.activeWorktrees.set(taskId, shadow);
    return shadow;
  }

  public async cleanupShadowWorktree(taskId: string): Promise<void> {
    const shadow = this.activeWorktrees.get(taskId);
    const branchName = `onyx-agent-${taskId}`;
    const worktreePath = shadow ? shadow.worktreePath : join(this.sandboxBaseDir, taskId);

    // Explicitly unlink symlinks/junctions first to prevent recursive target deletion on Windows
    const heavyFolders = ['node_modules', '.venv', 'target'];
    for (const folder of heavyFolders) {
      const symlinkPath = join(worktreePath, folder);
      if (existsSync(symlinkPath)) {
        try {
          const stats = lstatSync(symlinkPath);
          if (stats.isSymbolicLink() || (process.platform === 'win32' && stats.isDirectory())) {
            // unlink safely removes symlink/junction without touching target
            await unlink(symlinkPath);
          }
        } catch {
          // ignore
        }
      }
    }

    try {
      await execFileAsync('git', ['worktree', 'remove', '--force', worktreePath], {
        cwd: this.repoRoot,
      });
    } catch {
      // fallback delete dir
      try {
        await rm(worktreePath, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }

    try {
      await execFileAsync('git', ['branch', '-D', branchName], {
        cwd: this.repoRoot,
      });
    } catch {
      // ignore if branch already deleted
    }

    this.activeWorktrees.delete(taskId);
  }

  public getShadowWorktree(taskId: string): ShadowWorktree | undefined {
    return this.activeWorktrees.get(taskId);
  }

  public calculateDirectorySize(dirPath: string): number {
    let totalSize = 0;
    if (!existsSync(dirPath)) return 0;

    const traverse = (current: string) => {
      try {
        const entries = readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(current, entry.name);
          // Skip symlinks
          if (entry.isSymbolicLink()) continue;
          if (entry.isDirectory()) {
            traverse(fullPath);
          } else if (entry.isFile()) {
            totalSize += statSync(fullPath).size;
          }
        }
      } catch {
        // ignore unreadable
      }
    };

    traverse(dirPath);
    return totalSize;
  }

  private async symlinkHeavyFolders(worktreePath: string): Promise<void> {
    const heavyFolders = ['node_modules', '.venv', 'target'];
    for (const folder of heavyFolders) {
      const sourcePath = join(this.repoRoot, folder);
      const targetPath = join(worktreePath, folder);

      if (existsSync(sourcePath) && !existsSync(targetPath)) {
        try {
          // On Windows, use 'junction' for directory symlinks without admin privileges
          const type = process.platform === 'win32' ? 'junction' : 'dir';
          await symlink(sourcePath, targetPath, type);
        } catch {
          // Fallback or ignore if symlink fails
        }
      }
    }
  }
}
