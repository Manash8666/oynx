import { TreeSitterParser } from '../ast/tree-sitter-parser.js';
import type { AstReference } from '../ast/types.js';
import type { AstChunk } from './types.js';

export class AstChunker {
  private parser: TreeSitterParser;

  constructor(parser?: TreeSitterParser) {
    this.parser = parser || new TreeSitterParser();
  }

  public chunkFile(filePath: string, content: string): AstChunk[] {
    const parsed = this.parser.parse(filePath, content);
    const chunks: AstChunk[] = [];
    const lines = content.split(/\r?\n/);

    const fileImports = parsed.references
      .filter((r: AstReference) => r.kind === 'import')
      .map((r: AstReference) => r.targetSymbol);

    for (const sym of parsed.symbols) {
      const chunkContent = sym.body || lines.slice(sym.startLine - 1, sym.endLine).join('\n');

      chunks.push({
        id: `${filePath}#${sym.name}`,
        filePath,
        symbolName: sym.name,
        kind: sym.kind,
        startLine: sym.startLine,
        endLine: sym.endLine,
        content: chunkContent,
        imports: [...fileImports],
        docstring: sym.docstring,
        isExported: sym.isExported,
      });
    }

    // If file has no symbols (e.g. script or plain config), create whole-file chunk
    if (chunks.length === 0 && content.trim().length > 0) {
      chunks.push({
        id: `${filePath}#module`,
        filePath,
        symbolName: 'module',
        kind: 'module',
        startLine: 1,
        endLine: lines.length,
        content,
        imports: fileImports,
        isExported: true,
      });
    }

    return chunks;
  }
}
