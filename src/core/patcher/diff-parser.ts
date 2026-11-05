import type { DiffHunk, PatchOperation } from './types.js';

export class DiffParser {
  private static readonly TRUNCATION_PATTERNS = [
    /\/\/\s*\.\.\.\s*existing\s+code\b/i,
    /\/\/\s*rest\s+of\s+code\s+remains\s+unchanged\b/i,
    /\/\*\s*\.\.\.\s*existing\s+code\s*\*\//i,
    /\/\*\s*rest\s+of\s+code\s+remains\s+unchanged\s*\*\//i,
    /\/\/\s*\.\.\.\s*rest\s+of\s+the\s+file\b/i,
    /\/\/\s*existing\s+imports\s+remain\s+the\s+same\b/i,
  ];

  public static parse(llmOutput: string): PatchOperation[] {
    const operations: PatchOperation[] = [];

    // 1. Check for Unified Diffs: diff --git a/... b/...
    const unifiedOperations = this.parseUnifiedDiffs(llmOutput);
    if (unifiedOperations.length > 0) {
      operations.push(...unifiedOperations);
    }

    // 2. Check for Search/Replace blocks: <<<<<<< SEARCH ... ======= ... >>>>>>> REPLACE
    const searchReplaceOps = this.parseSearchReplaceBlocks(llmOutput);
    if (searchReplaceOps.length > 0) {
      operations.push(...searchReplaceOps);
    }

    // 3. Check for Explicit Whole File Code Blocks:
    // e.g., ```typescript path="src/foo.ts" or File: `src/foo.ts`
    if (operations.length === 0) {
      const wholeFileOps = this.parseWholeFileBlocks(llmOutput);
      operations.push(...wholeFileOps);
    }

    return operations;
  }

  public static assertNoIncompleteTruncation(content: string, filePath = 'unknown'): void {
    for (const pattern of this.TRUNCATION_PATTERNS) {
      if (pattern.test(content)) {
        throw new Error(
          `INCOMPLETE_PATCH_EXCEPTION: Detected banned truncation placeholder '${pattern.source}' in patch for ${filePath}`
        );
      }
    }
  }

  private static parseUnifiedDiffs(text: string): PatchOperation[] {
    const ops: PatchOperation[] = [];
    const diffFileSplit = text.split(/(?=diff\s+--git\s+a\/)/g);

    for (const fileChunk of diffFileSplit) {
      if (!fileChunk.trim().startsWith('diff --git a/')) continue;

      const pathMatch = fileChunk.match(/diff\s+--git\s+a\/(.+?)\s+b\/(.+)/);
      if (!pathMatch) continue;

      const filePath = pathMatch[2].trim();
      const hunkMatches = fileChunk.split(/(?=@@\s+-\d+)/g);
      const hunks: DiffHunk[] = [];

      for (const rawHunk of hunkMatches) {
        const headerMatch = rawHunk.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/);
        if (!headerMatch) continue;

        const oldStart = parseInt(headerMatch[1], 10);
        const oldLines = headerMatch[2] !== undefined ? parseInt(headerMatch[2], 10) : 1;
        const newStart = parseInt(headerMatch[3], 10);
        const newLines = headerMatch[4] !== undefined ? parseInt(headerMatch[4], 10) : 1;

        const lines = rawHunk
          .split(/\r?\n/)
          .slice(1)
          .filter((l) => l.startsWith('+') || l.startsWith('-') || l.startsWith(' '));

        hunks.push({
          oldStart,
          oldLines,
          newStart,
          newLines,
          lines,
        });
      }

      if (hunks.length > 0) {
        ops.push({
          filePath,
          type: 'unified',
          hunks,
        });
      }
    }

    return ops;
  }

  private static parseSearchReplaceBlocks(text: string): PatchOperation[] {
    const ops: PatchOperation[] = [];
    // Pattern: [File: path/to/file or Target: path/to/file] followed by <<<<<<< SEARCH ... ======= ... >>>>>>> REPLACE
    const blockRegex = /(?:(?:File|Target|Path):\s*[`"']?([^\r\n`"']+)['"]?[\s\S]*?)?<{5,8}\s*SEARCH\r?\n([\s\S]*?)\r?\n={5,8}\r?\n([\s\S]*?)\r?\n>{5,8}\s*REPLACE/g;

    let match: RegExpExecArray | null;
    let lastFile = 'target-file';

    while ((match = blockRegex.exec(text)) !== null) {
      const explicitFile = match[1]?.trim();
      if (explicitFile) {
        lastFile = explicitFile;
      }
      const searchBlock = match[2];
      const replaceBlock = match[3];

      ops.push({
        filePath: lastFile,
        type: 'search_replace',
        searchBlock,
        replaceBlock,
      });
    }

    return ops;
  }

  private static parseWholeFileBlocks(text: string): PatchOperation[] {
    const ops: PatchOperation[] = [];
    // Matches ```lang path="filepath" ... ``` or File: filepath \n ```lang ... ```
    const fileHeaderRegex = /(?:(?:File|Target):\s*[`"']?([^\r\n`"']+)['"]?|```[a-z0-9_-]+\s+(?:path|file)=["']([^"']+)["'])\r?\n([\s\S]*?)```/g;

    let match: RegExpExecArray | null;
    while ((match = fileHeaderRegex.exec(text)) !== null) {
      const filePath = (match[1] || match[2]).trim();
      const content = match[3];

      this.assertNoIncompleteTruncation(content, filePath);

      ops.push({
        filePath,
        type: 'whole_file',
        wholeContent: content,
      });
    }

    return ops;
  }
}
