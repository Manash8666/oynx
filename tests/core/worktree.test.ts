import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorktreeManager } from '../../src/core/vcs/worktree-manager.js';
import { AgentExecutionContext } from '../../src/core/agent/execution-context.js';
import { MergeResolver } from '../../src/core/vcs/merge-resolver.js';
import { join } from 'path';
import { existsSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';

describe('Background Git Shadow Worktree Orchestrator (Prompt 2)', () => {
  const repoRoot = process.cwd();
  let worktreeManager: WorktreeManager;
  let taskId: string;

  beforeEach(() => {
    worktreeManager = new WorktreeManager({ repoRoot });
    taskId = 'task-' + Math.random().toString(36).substring(2, 8);
  });

  afterEach(async () => {
    if (taskId) {
      await worktreeManager.cleanupShadowWorktree(taskId);
    }
  });

  it('should initialize shadow worktree isolated in .onyx/sandboxes/[taskId]', async () => {
    const shadow = await worktreeManager.createShadowWorktree(taskId);
    expect(shadow.taskId).toBe(taskId);
    expect(shadow.worktreePath).toContain(join('.onyx', 'sandboxes', taskId));
    expect(existsSync(shadow.worktreePath)).toBe(true);
  }, 15000);

  it('should enforce path boundary containment in execution context', async () => {
    const context = new AgentExecutionContext(taskId, worktreeManager);
    await context.initialize();

    expect(context.getStatus()).toBe('RUNNING');
    const safePath = context.resolveSandboxPath('src/sample.ts');
    expect(safePath.startsWith(context.getWorkingDirectory())).toBe(true);

    // Attempt path traversal outside sandbox
    expect(() => {
      context.resolveSandboxPath('../../sensitive.env');
    }).toThrowError(/SECURITY_BOUNDARY_VIOLATION/);

    await context.teardown();
    expect(context.getStatus()).toBe('COMPLETED');
  }, 15000);

  it('should generate three-way diff proposal and detect host user conflicts', async () => {
    const resolver = new MergeResolver(repoRoot);
    const proposal = await resolver.generateProposal(taskId);

    expect(proposal.taskId).toBe(taskId);
    expect(proposal.sourceBranch).toBe(`onyx-agent-${taskId}`);
    expect(Array.isArray(proposal.files)).toBe(true);
  }, 15000);

  it('should cleanly teardown without leaving active worktree or branch', async () => {
    const shadow = await worktreeManager.createShadowWorktree(taskId);
    const path = shadow.worktreePath;

    await worktreeManager.cleanupShadowWorktree(taskId);
    expect(worktreeManager.getShadowWorktree(taskId)).toBeUndefined();
    expect(existsSync(path)).toBe(false);
  }, 15000);
});
