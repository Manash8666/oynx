import { describe, it, expect, beforeEach } from 'vitest';
import { PatchEngine } from '../../src/core/patcher/engine.js';
import { DiffParser } from '../../src/core/patcher/diff-parser.js';
import { FuzzyMatcher } from '../../src/core/patcher/fuzzy-matcher.js';
import { AstPatcher } from '../../src/core/patcher/ast-patcher.js';

describe('Resilient Multi-File Fuzzy Diff & AST Patcher (Prompt 1)', () => {
  let engine: PatchEngine;

  beforeEach(() => {
    engine = new PatchEngine();
  });

  it('should parse and apply exact unified diffs', async () => {
    const originalFile = `
import { Config } from './config.js';

export function calculateTotal(items: number[]): number {
  let total = 0;
  for (const item of items) {
    total += item;
  }
  return total;
}
`.trim();

    const unifiedDiff = `
diff --git a/src/calc.ts b/src/calc.ts
--- a/src/calc.ts
+++ b/src/calc.ts
@@ -3,7 +3,8 @@
 export function calculateTotal(items: number[]): number {
   let total = 0;
   for (const item of items) {
-    total += item;
+    const safe = item > 0 ? item : 0;
+    total += safe;
   }
   return total;
 }
`.trim();

    const ops = DiffParser.parse(unifiedDiff);
    expect(ops.length).toBe(1);
    expect(ops[0].type).toBe('unified');

    const result = engine.applySingleOperation(ops[0], originalFile);
    expect(result.success).toBe(true);
    expect(result.patchedContent).toContain('const safe = item > 0 ? item : 0;');
    expect(result.patchedContent).toContain('total += safe;');
  });

  it('should apply shifted line fuzzy diffs using Levenshtein / Jaccard sliding window', async () => {
    // The original file has 5 extra lines at the top shifting all lines down
    const shiftedFile = `
// Extra line 1
// Extra line 2
// Extra line 3
// Extra line 4
// Extra line 5
export function authenticate(user: string, pass: string): boolean {
  if (!user) return false;
  return pass === "secret";
}
`.trim();

    // The LLM generated a search/replace with indentation and shifted positions
    const searchReplace = `
File: src/auth.ts
<<<<<<< SEARCH
export function authenticate(user: string, pass: string): boolean {
	if (!user) return false;
	return pass === "secret";
}
=======
export function authenticate(user: string, pass: string): boolean {
  if (!user || !pass) return false;
  return pass.length >= 6;
}
>>>>>>> REPLACE
`.trim();

    const ops = DiffParser.parse(searchReplace);
    expect(ops.length).toBe(1);
    expect(ops[0].type).toBe('search_replace');

    const result = engine.applySingleOperation(ops[0], shiftedFile);
    expect(result.success).toBe(true);
    expect(result.patchedContent).toContain('if (!user || !pass) return false;');
    expect(result.patchedContent).toContain('return pass.length >= 6;');
  });

  it('should fall back to AST splicing when code block contains placeholders', async () => {
    const astPatcher = new AstPatcher();
    const sourceCode = `
import { Logger } from './logger.js';

export function processJob(jobId: string, priority: number): boolean {
  const logger = new Logger();
  logger.info("Starting " + jobId);
  for (let i = 0; i < 10; i++) {
    logger.debug("Step " + i);
  }
  return true;
}

export function cleanup(): void {
  // cleanup
}
`.trim();

    // LLM modified signature with placeholder body: /* existing logic */
    const replacementSnippet = `
export function processJob(jobId: string, priority: number, retries = 3): boolean {
  /* existing logic */
}
`.trim();

    const spliceResult = astPatcher.spliceSymbol(
      'src/jobs.ts',
      sourceCode,
      'processJob',
      replacementSnippet
    );

    expect(spliceResult.success).toBe(true);
    expect(spliceResult.patchedContent).toContain('export function processJob(jobId: string, priority: number, retries = 3): boolean');
    // Inner original body preserved
    expect(spliceResult.patchedContent).toContain('const logger = new Logger();');
    expect(spliceResult.patchedContent).toContain('logger.info("Starting " + jobId);');
    expect(spliceResult.patchedContent).toContain('export function cleanup(): void');
  });

  it('should abort entire multi-file patch atomically if any file fails verification', async () => {
    const ops = [
      {
        filePath: 'src/file1.ts',
        type: 'whole_file' as const,
        wholeContent: 'export const A = 1;',
      },
      {
        filePath: 'src/file2.ts',
        type: 'search_replace' as const,
        searchBlock: 'NON_EXISTENT_SEARCH_CONTENT_THAT_CANNOT_BE_FOUND_ANYWHERE',
        replaceBlock: 'export const B = 2;',
      },
    ];

    const result = await engine.applyOperations(ops, { dryRun: true });
    expect(result.success).toBe(false);
    expect(result.aborted).toBe(true);
    expect(result.abortReason).toContain('Atomic rollback triggered on src/file2.ts');
  });

  it('should trigger INCOMPLETE_PATCH_EXCEPTION on banned truncation tokens', async () => {
    const truncatedContent = `
export function renderPage() {
  // ... existing code ...
}
`;
    expect(() => {
      DiffParser.assertNoIncompleteTruncation(truncatedContent, 'src/page.ts');
    }).toThrowError(/INCOMPLETE_PATCH_EXCEPTION/);
  });
});
