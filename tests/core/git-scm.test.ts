import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GitScmService } from '../../src/core/vcs/git-scm-service.js';
import { AgentExecutionContext, REPOSITORY_CLEANLINESS_RULE } from '../../src/core/agent/execution-context.js';
import { WorktreeManager } from '../../src/core/vcs/worktree-manager.js';
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execSync } from 'child_process';

describe('Onyx Core Git SCM & Invariant Gate Subsystem', () => {
  let testRepoDir: string;
  let scmService: GitScmService;
  let worktreeManager: WorktreeManager;

  beforeEach(() => {
    testRepoDir = mkdtempSync(join(tmpdir(), 'onyx_scm_test_'));
    // Initialize git repository
    execSync('git init -b main', { cwd: testRepoDir });
    execSync('git config user.name "Onyx Agent"', { cwd: testRepoDir });
    execSync('git config user.email "agent@onyx.si"', { cwd: testRepoDir });

    // Initial commit
    writeFileSync(join(testRepoDir, 'README.md'), '# Onyx Project\n');
    execSync('git add README.md && git commit -m "chore: initial commit"', { cwd: testRepoDir });

    scmService = new GitScmService({ repoRoot: testRepoDir, statusLimit: 10 });
    worktreeManager = new WorktreeManager({
      repoRoot: testRepoDir,
      sandboxBaseDir: join(testRepoDir, '.onyx', 'sandboxes'),
    });
  });

  afterEach(() => {
    try {
      rmSync(testRepoDir, { recursive: true, force: true });
    } catch {
      // ignore teardown cleanup
    }
  });

  it('should categorize files and enforce SCM statusLimit overflow protection', async () => {
    // Create multiple modified, untracked, and staged files
    writeFileSync(join(testRepoDir, 'file1.ts'), 'export const a = 1;\n');
    writeFileSync(join(testRepoDir, 'file2.ts'), 'export const b = 2;\n');
    writeFileSync(join(testRepoDir, 'untracked1.log'), 'log 1\n');
    writeFileSync(join(testRepoDir, 'untracked2.log'), 'log 2\n');

    execSync('git add file1.ts', { cwd: testRepoDir });

    // Check with low status limit (e.g. 2)
    const overflowStatus = await scmService.getStatus({ statusLimit: 2 });
    expect(overflowStatus.totalCount).toBeGreaterThanOrEqual(3);
    expect(overflowStatus.isOverflow).toBe(true);
    expect(overflowStatus.statusLimit).toBe(2);

    // Check with regular limit
    const regularStatus = await scmService.getStatus({ statusLimit: 50 });
    expect(regularStatus.isOverflow).toBe(false);
    expect(regularStatus.staged.some((f) => f.path.includes('file1.ts'))).toBe(true);
    expect(regularStatus.untracked.some((f) => f.path.includes('untracked1.log'))).toBe(true);
    expect(regularStatus.activeBranch).toBe('main');
  });

  it('should draft intelligent Conventional Commit messages from staged diffs', async () => {
    // 1. Feature addition
    const featDiff = `
diff --git a/src/core/vcs/engine.ts b/src/core/vcs/engine.ts
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/src/core/vcs/engine.ts
@@ -0,0 +1,5 @@
+export function createEngine() {
+  return { active: true };
+}
+`;
    const featCommit = await scmService.generateConventionalCommit(featDiff);
    expect(featCommit.type).toBe('feat');
    expect(featCommit.formatted).toContain('implement');

    // 2. Bug fix
    const fixDiff = `
diff --git a/src/auth/login.ts b/src/auth/login.ts
--- a/src/auth/login.ts
+++ b/src/auth/login.ts
@@ -10,2 +10,3 @@
- throw new Error("bad auth");
+ // fix error condition
+ handleAuthException(err);
`;
    const fixCommit = await scmService.generateConventionalCommit(fixDiff);
    expect(fixCommit.type).toBe('fix');
    expect(fixCommit.formatted).toContain('resolve defect and enhance error handling');

    // 3. Tests
    const testDiff = `
diff --git a/tests/core/sample.test.ts b/tests/core/sample.test.ts
new file mode 100644
`;
    const testCommit = await scmService.generateConventionalCommit(testDiff);
    expect(testCommit.type).toBe('test');
    expect(testCommit.formatted).toContain('add and verify test suites');
  });

  it('should create safe stash snapshots and allow branch context switching', async () => {
    writeFileSync(join(testRepoDir, 'dirty_work.txt'), 'in progress code\n');

    const snapshot = await scmService.createStashSnapshot('speculative-experiment');
    expect(snapshot.id).toBeDefined();
    expect(snapshot.branch).toBe('main');

    // Switch branch
    await scmService.switchBranch('experiment-branch', true);
    const status = await scmService.getStatus();
    expect(status.activeBranch).toBe('experiment-branch');
  });

  it('should resolve conflicting blocks cleanly using AST analysis without manual merge UI', () => {
    const currentCode = `
import { ExistingService } from './service.js';

export function calculateTax(amount: number): number {
  return amount * 0.15;
}
`.trim();

    const incomingCode = `
import { AnalyticsLogger } from './analytics.js';

export function calculateDiscount(price: number): number {
  return price * 0.10;
}
`.trim();

    const resolution = scmService.resolveConflictWithAST('src/billing.ts', {
      filePath: 'src/billing.ts',
      currentBranch: 'main',
      incomingBranch: 'agent-feature',
      currentCode,
      incomingCode,
    });

    expect(resolution.autoResolved).toBe(true);
    expect(resolution.resolvedCode).toContain('import { ExistingService }');
    expect(resolution.resolvedCode).toContain('import { AnalyticsLogger }');
    expect(resolution.resolvedCode).toContain('calculateTax');
    expect(resolution.resolvedCode).toContain('calculateDiscount');
    expect(resolution.mergedSymbols).toContain('calculateTax');
    expect(resolution.mergedSymbols).toContain('calculateDiscount');
  });

  it('should enforce Pre-Flight GitIgnore Gate and auto-exclude build artifacts', () => {
    const agentCtx = new AgentExecutionContext('task-cleanliness', worktreeManager);

    // Run pre-flight check in test repo where .gitignore is missing
    const preFlight = agentCtx.verifyPreFlightGitIgnore(testRepoDir);
    expect(preFlight.created).toBe(true);

    const content = readFileSync(join(testRepoDir, '.gitignore'), 'utf-8');
    expect(content).toContain('node_modules/');
    expect(content).toContain('dist/');
    expect(content).toContain('.onyx/sandboxes/');
    expect(content).toContain('*.log');
  });

  it('should trigger untracked files safety gate when new files exceed threshold', async () => {
    const agentCtx = new AgentExecutionContext('task-overflow', worktreeManager);

    // Simulate an operation producing 60 untracked files in a cache folder
    const cacheDir = join(testRepoDir, 'temp_cache');
    execSync(`mkdir "${cacheDir}"`);
    for (let i = 0; i < 60; i++) {
      writeFileSync(join(cacheDir, `chunk_${i}.bin`), `data ${i}`);
    }

    // Run untracked file gate with threshold 50
    const gateResult = await agentCtx.enforceUntrackedFileGate(50, testRepoDir);
    expect(gateResult.triggered).toBe(true);
    expect(gateResult.untrackedCount).toBeGreaterThanOrEqual(60);
    expect(gateResult.autoAppendedPatterns).toContain('temp_cache/');

    // Verify .gitignore was updated
    const gitignoreContent = readFileSync(join(testRepoDir, '.gitignore'), 'utf-8');
    expect(gitignoreContent).toContain('temp_cache/');
  });
});
