import { describe, it, expect, beforeEach } from 'vitest';
import { ProblemMatcher } from '../../src/core/tasks/problem-matcher.js';
import { ProblemStore } from '../../src/core/tasks/problem-store.js';
import { TaskRunner } from '../../src/core/tasks/task-runner.js';

describe('Task Runner & Regex Problem Matcher Engine (VS Code Parity)', () => {
  let problemStore: ProblemStore;
  let taskRunner: TaskRunner;

  beforeEach(() => {
    problemStore = new ProblemStore();
    taskRunner = new TaskRunner(problemStore);
  });

  it('should parse TypeScript (tsc) compiler output with file, line, severity, code, and message', () => {
    const matcher = new ProblemMatcher('$tsc');
    const tscOutput = `
src/services/auth.ts(45,12): error TS2322: Type 'string' is not assignable to type 'number'.
src/utils/math.ts(10,3): warning TS2554: Expected 2 arguments, but got 1.
`;
    const problems = matcher.parseChunk(tscOutput);

    expect(problems.length).toBe(2);
    expect(problems[0].filePath).toBe('src/services/auth.ts');
    expect(problems[0].line).toBe(45);
    expect(problems[0].column).toBe(12);
    expect(problems[0].severity).toBe('error');
    expect(problems[0].code).toBe('2322');
    expect(problems[0].message).toContain("Type 'string' is not assignable to type 'number'.");

    expect(problems[1].severity).toBe('warning');
  });

  it('should parse ESLint compiler output format', () => {
    const matcher = new ProblemMatcher('$eslint');
    const eslintOutput = `
src/components/Header.tsx:18:7: error 'userName' is defined but never used. [no-unused-vars]
`;
    const problems = matcher.parseChunk(eslintOutput);

    expect(problems.length).toBe(1);
    expect(problems[0].filePath).toBe('src/components/Header.tsx');
    expect(problems[0].line).toBe(18);
    expect(problems[0].column).toBe(7);
    expect(problems[0].severity).toBe('error');
    expect(problems[0].message).toContain("'userName' is defined but never used.");
  });

  it('should parse GCC compiler output format', () => {
    const matcher = new ProblemMatcher('$gcc');
    const gccOutput = `
main.c:15:3: error: expected ';' before '}' token
`;
    const problems = matcher.parseChunk(gccOutput);

    expect(problems.length).toBe(1);
    expect(problems[0].filePath).toBe('main.c');
    expect(problems[0].line).toBe(15);
    expect(problems[0].column).toBe(3);
    expect(problems[0].severity).toBe('error');
    expect(problems[0].message).toContain("expected ';' before '}' token");
  });

  it('should detect background watcher beginsPattern and endsPattern', () => {
    const matcher = new ProblemMatcher('$tsc');

    let watchStarted = false;
    let watchEnded = false;

    matcher.on('watchBegins', () => {
      watchStarted = true;
    });
    matcher.on('watchEnds', () => {
      watchEnded = true;
    });

    matcher.parseChunk('Starting compilation in watch mode...');
    expect(watchStarted).toBe(true);

    matcher.parseChunk('Found 0 errors. Watching for file changes.');
    expect(watchEnded).toBe(true);
  });

  it('should expose aggregated diagnostics to agent via getWorkspaceDiagnostics()', async () => {
    await taskRunner.runTask(
      {
        label: 'Build TypeScript',
        type: 'shell',
        command: 'tsc -b',
        problemMatcher: '$tsc',
      },
      `src/app.ts(1,1): error TS1005: ';' expected.`
    );

    const diagnostics = problemStore.getWorkspaceDiagnostics();
    expect(diagnostics.length).toBe(1);
    expect(diagnostics[0].file).toBe('src/app.ts');
    expect(diagnostics[0].severity).toBe('error');
    expect(diagnostics[0].message).toContain("';' expected.");
  });
});
