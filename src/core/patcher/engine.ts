import { readFile, writeFile } from 'fs/promises';
import { DiffParser } from './diff-parser.js';
import { FuzzyMatcher } from './fuzzy-matcher.js';
import { AstPatcher } from './ast-patcher.js';
import type {
  MultiFilePatchResult,
  PatchApplyResult,
  PatchOperation,
} from './types.js';

export interface PatchEngineOptions {
  dryRun?: boolean;
  baseDir?: string;
  allowAstFallback?: boolean;
}

export class PatchEngine {
  private astPatcher: AstPatcher;

  constructor() {
    this.astPatcher = new AstPatcher();
  }

  public async applyPatch(
    llmOutput: string,
    options: PatchEngineOptions = {}
  ): Promise<MultiFilePatchResult> {
    const operations = DiffParser.parse(llmOutput);
    if (operations.length === 0) {
      return {
        success: false,
        appliedFiles: [],
        results: new Map(),
        aborted: true,
        abortReason: 'No valid patch operations found in LLM output',
      };
    }

    return this.applyOperations(operations, options);
  }

  public async applyOperations(
    operations: PatchOperation[],
    options: PatchEngineOptions = {}
  ): Promise<MultiFilePatchResult> {
    const stagedFiles = new Map<string, string>();
    const originalFiles = new Map<string, string>();
    const lineEndings = new Map<string, '\r\n' | '\n'>();
    const results = new Map<string, PatchApplyResult>();

    // 1. Staging phase: Apply each operation in memory
    for (const op of operations) {
      const filePath = op.filePath;

      // Load original file if not already in staged map
      if (!originalFiles.has(filePath)) {
        let content = '';
        try {
          content = await readFile(filePath, 'utf-8');
        } catch {
          // New file
          content = '';
        }
        originalFiles.set(filePath, content);
        lineEndings.set(filePath, content.includes('\r\n') ? '\r\n' : '\n');
        stagedFiles.set(filePath, content);
      }

      const currentContent = stagedFiles.get(filePath)!;
      let patchResult: PatchApplyResult;

      try {
        patchResult = this.applySingleOperation(op, currentContent, options);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          appliedFiles: [],
          results,
          aborted: true,
          abortReason: `Atomic rollback triggered on ${filePath}: ${errorMsg}`,
        };
      }

      if (!patchResult.success) {
        // Atomic abort
        return {
          success: false,
          appliedFiles: [],
          results,
          aborted: true,
          abortReason: `Atomic rollback triggered on ${filePath}: ${patchResult.error}`,
        };
      }

      stagedFiles.set(filePath, patchResult.patchedContent);
      results.set(filePath, patchResult);
    }

    // 2. Commit phase: Write all files to disk if not dryRun
    if (!options.dryRun) {
      for (const [filePath, content] of stagedFiles.entries()) {
        const le = lineEndings.get(filePath) || '\n';
        const normalized = le === '\r\n' ? content.replace(/\r?\n/g, '\r\n') : content.replace(/\r\n/g, '\n');
        await writeFile(filePath, normalized, 'utf-8');
      }
    }

    return {
      success: true,
      appliedFiles: Array.from(stagedFiles.keys()),
      results,
      aborted: false,
    };
  }

  public applySingleOperation(
    op: PatchOperation,
    originalContent: string,
    options: PatchEngineOptions = {}
  ): PatchApplyResult {
    // Check truncation invariant
    if (op.wholeContent) {
      DiffParser.assertNoIncompleteTruncation(op.wholeContent, op.filePath);
    }
    if (op.replaceBlock) {
      DiffParser.assertNoIncompleteTruncation(op.replaceBlock, op.filePath);
    }

    // A. Whole file replacement
    if (op.type === 'whole_file' && op.wholeContent !== undefined) {
      return {
        filePath: op.filePath,
        success: true,
        appliedType: 'whole_file',
        originalContent,
        patchedContent: op.wholeContent,
      };
    }

    // B. Search and Replace Block
    if (op.type === 'search_replace' && op.searchBlock !== undefined && op.replaceBlock !== undefined) {
      const fileLines = originalContent.split(/\r?\n/);
      const searchLines = op.searchBlock.split(/\r?\n/);

      const match = FuzzyMatcher.findMatch(fileLines, searchLines);
      if (match.matched) {
        const replaceLines = op.replaceBlock.split(/\r?\n/);
        const newLines = [
          ...fileLines.slice(0, match.startLine),
          ...replaceLines,
          ...fileLines.slice(match.endLine),
        ];
        return {
          filePath: op.filePath,
          success: true,
          appliedType: 'search_replace',
          originalContent,
          patchedContent: newLines.join('\n'),
        };
      }

      // AST Fallback if fuzzy search failed
      if (options.allowAstFallback ?? true) {
        const astResult = this.astPatcher.spliceMatchingEnclosingNode(
          op.filePath,
          originalContent,
          op.replaceBlock
        );
        if (astResult.success) {
          return {
            filePath: op.filePath,
            success: true,
            appliedType: 'ast_splice',
            originalContent,
            patchedContent: astResult.patchedContent,
          };
        }
      }

      return {
        filePath: op.filePath,
        success: false,
        appliedType: 'search_replace',
        originalContent,
        patchedContent: originalContent,
        error: `Could not find fuzzy match or AST splice target for search block in ${op.filePath}`,
      };
    }

    // C. Unified Diff
    if (op.type === 'unified' && op.hunks && op.hunks.length > 0) {
      let fileLines = originalContent.split(/\r?\n/);

      for (const hunk of op.hunks) {
        const oldLines = hunk.lines
          .filter((l) => l.startsWith('-') || l.startsWith(' '))
          .map((l) => l.substring(1));
        const newLines = hunk.lines
          .filter((l) => l.startsWith('+') || l.startsWith(' '))
          .map((l) => l.substring(1));

        const startHint = Math.max(0, hunk.oldStart - 1);
        const match = FuzzyMatcher.findMatch(fileLines, oldLines, startHint);

        if (!match.matched) {
          return {
            filePath: op.filePath,
            success: false,
            appliedType: 'unified',
            originalContent,
            patchedContent: originalContent,
            error: `Failed to match unified diff hunk at line ${hunk.oldStart}`,
          };
        }

        fileLines = [
          ...fileLines.slice(0, match.startLine),
          ...newLines,
          ...fileLines.slice(match.endLine),
        ];
      }

      return {
        filePath: op.filePath,
        success: true,
        appliedType: 'unified',
        originalContent,
        patchedContent: fileLines.join('\n'),
      };
    }

    return {
      filePath: op.filePath,
      success: false,
      appliedType: op.type,
      originalContent,
      patchedContent: originalContent,
      error: `Unsupported patch operation type: ${op.type}`,
    };
  }
}
