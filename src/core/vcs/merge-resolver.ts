import { execFile } from 'child_process';
import { promisify } from 'util';
import type { MergeProposal, ThreeWayDiffEntry } from './types.js';

const execFileAsync = promisify(execFile);

export class MergeResolver {
  private repoRoot: string;

  constructor(repoRoot: string) {
    this.repoRoot = repoRoot;
  }

  public async generateProposal(taskId: string, targetBranch = 'HEAD'): Promise<MergeProposal> {
    const sourceBranch = `onyx-agent-${taskId}`;
    const diffEntries: ThreeWayDiffEntry[] = [];

    // Get uncommitted files in host workspace
    const hostDirtyFiles = await this.getHostDirtyFiles();

    // Get changed files between targetBranch and shadow branch
    let nameStatusOutput = '';
    try {
      const res = await execFileAsync('git', ['diff', '--name-status', targetBranch, sourceBranch], {
        cwd: this.repoRoot,
      });
      nameStatusOutput = res.stdout;
    } catch {
      // In synthetic or test environment without commit history
      nameStatusOutput = '';
    }

    const lines = nameStatusOutput.trim().split(/\r?\n/).filter(Boolean);
    let canFastForward = true;

    for (const line of lines) {
      const parts = line.split(/\s+/);
      const code = parts[0];
      const filePath = parts[1];
      if (!filePath) continue;

      const isHostDirty = hostDirtyFiles.has(filePath);
      const status: ThreeWayDiffEntry['status'] =
        isHostDirty ? 'conflict' : code === 'A' ? 'added' : code === 'D' ? 'deleted' : 'modified';

      if (isHostDirty) {
        canFastForward = false;
      }

      diffEntries.push({
        filePath,
        status,
        hasUserConflict: isHostDirty,
      });
    }

    return {
      taskId,
      sourceBranch,
      targetBranch,
      files: diffEntries,
      canFastForward,
    };
  }

  public async getHostDirtyFiles(): Promise<Set<string>> {
    const dirtyFiles = new Set<string>();
    try {
      const res = await execFileAsync('git', ['status', '--porcelain'], { cwd: this.repoRoot });
      const lines = res.stdout.trim().split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const path = line.substring(3).trim();
        if (path) dirtyFiles.add(path);
      }
    } catch {
      // ignore
    }
    return dirtyFiles;
  }

  public async applyMerge(proposal: MergeProposal): Promise<{ success: boolean; error?: string }> {
    if (!proposal.canFastForward) {
      return {
        success: false,
        error: 'Cannot fast-forward: host working tree has conflicting uncommitted user edits.',
      };
    }

    try {
      await execFileAsync('git', ['merge', '--no-ff', '-m', `Merge agent task ${proposal.taskId}`, proposal.sourceBranch], {
        cwd: this.repoRoot,
      });
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }
}
