import { TreeSitterParser } from '../ast/tree-sitter-parser.js';
import type { AstSymbol } from '../ast/types.js';

export class AstPatcher {
  private parser: TreeSitterParser;

  constructor(parser?: TreeSitterParser) {
    this.parser = parser || new TreeSitterParser();
  }

  /**
   * Splice or replace a specific AST node in the target file content.
   */
  public spliceSymbol(
    filePath: string,
    originalContent: string,
    symbolName: string,
    replacementCode: string
  ): { success: boolean; patchedContent: string; error?: string } {
    const parsed = this.parser.parse(filePath, originalContent);
    const targetSymbol = parsed.symbols.find((s: AstSymbol) => s.name === symbolName || s.name.endsWith(`.${symbolName}`));

    if (!targetSymbol) {
      return {
        success: false,
        patchedContent: originalContent,
        error: `Symbol '${symbolName}' not found in AST of ${filePath}`,
      };
    }

    const lines = originalContent.split(/\r?\n/);
    const startIdx = targetSymbol.startLine - 1;
    const endIdx = targetSymbol.endLine;

    // Check if replacementCode has an inner placeholder: /* existing logic */ or // ... existing body ...
    let finalReplacement = replacementCode;
    const hasInnerPlaceholder = /\/\*[\s\S]*?(?:existing|original)[\s\S]*?\*\/|\/\/\s*\.\.\.\s*existing\s+body/i.test(replacementCode);

    if (hasInnerPlaceholder && targetSymbol.body) {
      // Extract original inner body
      const originalBodyLines = targetSymbol.body.split(/\r?\n/);
      // Remove first line (signature) and last line (closing brace) if multiple lines
      if (originalBodyLines.length > 2) {
        const innerBody = originalBodyLines.slice(1, originalBodyLines.length - 1).join('\n');
        finalReplacement = replacementCode.replace(
          /\/\*[\s\S]*?(?:existing|original)[\s\S]*?\*\/|\/\/\s*\.\.\.\s*existing\s+body/gi,
          innerBody
        );
      }
    }

    const before = lines.slice(0, startIdx);
    const after = lines.slice(endIdx);
    const patchedContent = [...before, finalReplacement, ...after].join('\n');

    return {
      success: true,
      patchedContent,
    };
  }

  /**
   * Find matching symbol from candidate code block header and splice it.
   */
  public spliceMatchingEnclosingNode(
    filePath: string,
    originalContent: string,
    codeSnippet: string
  ): { success: boolean; patchedContent: string; error?: string } {
    // Detect symbol name from snippet
    const funcMatch = codeSnippet.match(/(?:function|class|interface|type|def|fn)\s+([A-Za-z0-9_$]+)/);
    if (!funcMatch) {
      return {
        success: false,
        patchedContent: originalContent,
        error: 'Unable to extract AST symbol name from replacement snippet',
      };
    }

    const symbolName = funcMatch[1];
    return this.spliceSymbol(filePath, originalContent, symbolName, codeSnippet);
  }
}
