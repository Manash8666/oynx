import { WorktreeManager } from '../../src/core/vcs/worktree-manager.js';
import { AgentExecutionContext } from '../../src/core/agent/execution-context.js';
import { MergeResolver } from '../../src/core/vcs/merge-resolver.js';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

async function runStandaloneVerification() {
  console.log('--- Verifying Background Git Shadow Worktree Orchestrator ---');
  const repoRoot = process.cwd();
  const initialStatus = execSync('git status --porcelain', { encoding: 'utf-8' });

  const taskId = 'standalone-' + Date.now().toString(36);
  const manager = new WorktreeManager({ repoRoot });
  const context = new AgentExecutionContext(taskId, manager);

  console.log(`1. Initializing shadow worktree for task ${taskId}...`);
  const shadow = await context.initialize();
  console.log(`✓ Shadow worktree created at: ${shadow.worktreePath}`);

  console.log('2. Verifying path containment & security boundaries...');
  const inside = context.resolveSandboxPath('test.ts');
  if (!inside.startsWith(shadow.worktreePath)) {
    throw new Error('Sandbox containment failed');
  }

  let caught = false;
  try {
    context.resolveSandboxPath('../../secret.env');
  } catch {
    caught = true;
  }
  if (!caught) throw new Error('Path traversal guard failed');
  console.log('✓ Security boundary verification passed');

  console.log('3. Resolving three-way merge proposal...');
  const resolver = new MergeResolver(repoRoot);
  const proposal = await resolver.generateProposal(taskId);
  console.log(`✓ Merge proposal generated. Can fast-forward: ${proposal.canFastForward}`);

  console.log('4. Tearing down shadow worktree and verifying host git status...');
  await context.teardown();
  if (existsSync(shadow.worktreePath)) {
    throw new Error('Shadow worktree path was not removed');
  }

  const finalStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (initialStatus !== finalStatus) {
    throw new Error("Git status changed unexpectedly in host repo");
  }
  console.log('✓ Clean teardown confirmed. Main repo git status untouched.');
  console.log('All Shadow Worktree tests passed with exit code 0.');
}

runStandaloneVerification().catch((err) => {
  console.error('Worktree verification failed:', err);
  process.exit(1);
});
