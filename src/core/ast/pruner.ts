import type {
  DependencyGraphNode,
  PrunerResult,
  SupportedLanguage,
} from './types.js';
import { TreeSitterParser } from './tree-sitter-parser.js';
import type { DependencyGraphBuilder } from './graph-builder.js';

export interface PruneOptions {
  replacementComment?: string;
  preserveDocstrings?: boolean;
  minTokenReductionPercent?: number;
}

export class AstPruner {
  private parser: TreeSitterParser;

  constructor(parser?: TreeSitterParser) {
    this.parser = parser || new TreeSitterParser();
  }

  /**
   * Estimate token count using standard LLM token estimation (average 3.8 chars per token)
   */
  public estimateTokenCount(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    // Hybrid approach: words + punctuation + whitespace normalization
    const tokensByWords = text.trim().split(/\s+/).length * 1.3;
    const tokensByChars = text.length / 3.8;
    return Math.max(1, Math.round((tokensByWords + tokensByChars) / 2));
  }

  /**
   * Prune a single source code string, removing implementation bodies while preserving
   * all type signatures, interfaces, classes, and exported contracts.
   */
  public pruneSource(
    filePath: string,
    sourceCode: string,
    language?: SupportedLanguage,
    options: PruneOptions = {}
  ): PrunerResult {
    const lang = language ?? this.parser.detectLanguage(filePath);
    const parsed = this.parser.parse(filePath, sourceCode, lang);

    const replacement = options.replacementComment ?? '/* implementation omitted */';
    const lines = sourceCode.split(/\r?\n/);
    const preservedSymbols: string[] = [];

    let prunedLines: string[] = [];

    switch (lang) {
      case 'typescript':
      case 'javascript':
        prunedLines = this.pruneTypeScriptLines(lines, parsed.symbols, replacement, preservedSymbols);
        break;
      case 'python':
        prunedLines = this.prunePythonLines(lines, parsed.symbols, replacement, preservedSymbols);
        break;
      case 'go':
        prunedLines = this.pruneGoLines(lines, parsed.symbols, replacement, preservedSymbols);
        break;
      case 'rust':
        prunedLines = this.pruneRustLines(lines, parsed.symbols, replacement, preservedSymbols);
        break;
      default:
        // Graceful fallback for unknown: preserve headers and truncate bodies
        prunedLines = this.pruneGenericLines(lines, replacement, preservedSymbols);
        break;
    }

    const prunedCode = prunedLines.join('\n').trim();
    const originalTokens = this.estimateTokenCount(sourceCode);
    const prunedTokens = this.estimateTokenCount(prunedCode);
    const reductionRatioPercent = originalTokens > 0
      ? Number((((originalTokens - prunedTokens) / originalTokens) * 100).toFixed(1))
      : 0;

    return {
      filePath,
      originalCode: sourceCode,
      prunedCode,
      originalTokens,
      prunedTokens,
      reductionRatioPercent,
      preservedSymbols,
    };
  }

  /**
   * Prune all dependency files for a target file in a workspace dependency graph.
   */
  public pruneDependencies(
    targetFilePath: string,
    graphBuilder: DependencyGraphBuilder,
    fileContents: Map<string, string>,
    options: PruneOptions = {}
  ): Map<string, PrunerResult> {
    const results = new Map<string, PrunerResult>();
    const graph = graphBuilder.getGraph();
    const targetSymbolIds = graph.files.get(targetFilePath) || [];

    // Find all external node dependencies
    const dependencyNodeIds = new Set<string>();
    for (const symId of targetSymbolIds) {
      const deps = graphBuilder.getTransitiveDependencies(symId);
      for (const d of deps) {
        if (d.filePath !== targetFilePath) {
          dependencyNodeIds.add(d.id);
        }
      }
    }

    // Identify unique dependency files
    const dependencyFiles = new Set<string>();
    for (const nodeId of dependencyNodeIds) {
      const node = graph.nodes.get(nodeId);
      if (node && node.filePath !== targetFilePath) {
        dependencyFiles.add(node.filePath);
      }
    }

    // Prune each dependency file
    for (const depPath of dependencyFiles) {
      const content = fileContents.get(depPath);
      if (content) {
        const result = this.pruneSource(depPath, content, undefined, options);
        results.set(depPath, result);
      }
    }

    return results;
  }

  /* -------------------------------------------------------------
   * TypeScript & JavaScript Pruning
   * ------------------------------------------------------------- */
  private pruneTypeScriptLines(
    lines: string[],
    symbols: import('./types.js').AstSymbol[],
    replacement: string,
    preservedSymbols: string[]
  ): string[] {
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Preserve imports
      if (trimmed.startsWith('import ') || trimmed.startsWith('export *') || trimmed.startsWith('export {')) {
        result.push(line);
        i++;
        continue;
      }

      // Check if current line starts an interface or type alias
      const isInterface = /^(?:export\s+)?interface\s+([A-Za-z0-9_$]+)/.test(trimmed);
      const isType = /^(?:export\s+)?type\s+([A-Za-z0-9_$]+)/.test(trimmed);
      const isEnum = /^(?:export\s+)?enum\s+([A-Za-z0-9_$]+)/.test(trimmed);

      if (isInterface || isType || isEnum) {
        // Find matching symbol
        const sym = symbols.find((s) => s.startLine === i + 1);
        if (sym) {
          preservedSymbols.push(sym.name);
          const end = sym.endLine;
          for (let j = i; j < end && j < lines.length; j++) {
            result.push(lines[j]);
          }
          i = end;
          continue;
        }
      }

      // Check if line starts an exported function
      const funcMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*\{?/);
      if (funcMatch) {
        const name = funcMatch[1];
        preservedSymbols.push(name);
        const signatureLine = line.replace(/\s*\{.*$/, '').trim();
        result.push(`${signatureLine} { ${replacement} }`);
        // Skip through the end of the function body
        const endLine = this.skipBraceBlock(lines, i);
        i = endLine;
        continue;
      }

      // Check if line starts a class declaration
      const classMatch = trimmed.match(/^(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_$]+)(?:\s+extends\s+[A-Za-z0-9_$]+)?(?:\s+implements\s+[A-Za-z0-9_$,\s]+)?\s*\{/);
      if (classMatch) {
        const className = classMatch[1];
        preservedSymbols.push(className);
        result.push(line.replace(/\s*\{.*$/, ' {'));
        const endLine = this.skipBraceBlock(lines, i);

        // Scan methods inside class and prune each method body
        let m = i + 1;
        while (m < endLine - 1 && m < lines.length) {
          const mLine = lines[m];
          const mTrimmed = mLine.trim();
          const indent = mLine.substring(0, mLine.length - mLine.trimStart().length);

          // Constructor
          if (/^(?:public\s+|private\s+|protected\s+)?constructor\s*\([^)]*\)\s*\{?/.test(mTrimmed)) {
            const mEnd = this.skipBraceBlock(lines, m);
            result.push(`${indent}${mTrimmed.replace(/\s*\{.*$/, '')} { ${replacement} }`);
            m = mEnd;
            continue;
          }

          // Method declaration
          const methodMatch = mTrimmed.match(/^(?:public\s+|private\s+|protected\s+|static\s+|async\s+)*(?:get\s+|set\s+)?([A-Za-z0-9_$]+)\s*\([^)]*\)(?:\s*:\s*[^{;]+)?\s*\{?/);
          if (methodMatch && !['if', 'for', 'while', 'switch'].includes(methodMatch[1])) {
            const methodName = methodMatch[1];
            preservedSymbols.push(`${className}.${methodName}`);
            const mEnd = this.skipBraceBlock(lines, m);
            result.push(`${indent}${mTrimmed.replace(/\s*\{.*$/, '')} { ${replacement} }`);
            m = mEnd;
            continue;
          }

          // Properties / fields
          if (mTrimmed.endsWith(';') || mTrimmed.includes(':') || mTrimmed.length > 0) {
            result.push(mLine);
          }
          m++;
        }

        result.push('}');
        i = endLine;
        continue;
      }

      // Non-exported helper or statement: if it's top-level comment, keep it
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        result.push(line);
      }

      i++;
    }

    return result;
  }

  /* -------------------------------------------------------------
   * Python Pruning
   * ------------------------------------------------------------- */
  private prunePythonLines(
    lines: string[],
    symbols: import('./types.js').AstSymbol[],
    replacement: string,
    preservedSymbols: string[]
  ): string[] {
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      const indent = line.length - line.trimStart().length;

      // Imports
      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        result.push(line);
        i++;
        continue;
      }

      // Class definition
      const classMatch = trimmed.match(/^class\s+([A-Za-z0-9_]+)(?:\([^)]*\))?:/);
      if (classMatch && indent === 0) {
        const className = classMatch[1];
        preservedSymbols.push(className);
        result.push(line);
        const endLine = this.skipPythonBlock(lines, i);

        // Process class methods
        let m = i + 1;
        while (m < endLine && m < lines.length) {
          const mLine = lines[m];
          const mTrimmed = mLine.trim();
          const mIndentStr = mLine.substring(0, mLine.length - mLine.trimStart().length);

          if (/^(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*\([^)]*\)(?:\s*->\s*[^:]+)?:/.test(mTrimmed)) {
            const mNameMatch = mTrimmed.match(/def\s+([A-Za-z0-9_]+)/);
            if (mNameMatch) preservedSymbols.push(`${className}.${mNameMatch[1]}`);
            result.push(mLine);
            result.push(`${mIndentStr}    ...  # ${replacement}`);
            m = this.skipPythonBlock(lines, m);
            continue;
          } else if (mTrimmed.length > 0 && !mTrimmed.startsWith('#')) {
            // Class variables / docstrings
            result.push(mLine);
          }
          m++;
        }

        i = endLine;
        continue;
      }

      // Top-level function
      const funcMatch = trimmed.match(/^(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*\([^)]*\)(?:\s*->\s*[^:]+)?:/);
      if (funcMatch && indent === 0) {
        const fnName = funcMatch[1];
        preservedSymbols.push(fnName);
        result.push(line);
        result.push(`    ...  # ${replacement}`);
        i = this.skipPythonBlock(lines, i);
        continue;
      }

      if (trimmed.startsWith('#')) {
        result.push(line);
      }
      i++;
    }

    return result;
  }

  /* -------------------------------------------------------------
   * Go Pruning
   * ------------------------------------------------------------- */
  private pruneGoLines(
    lines: string[],
    symbols: import('./types.js').AstSymbol[],
    replacement: string,
    preservedSymbols: string[]
  ): string[] {
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Package & Imports
      if (trimmed.startsWith('package ') || trimmed.startsWith('import ') || trimmed === 'import (') {
        result.push(line);
        if (trimmed === 'import (') {
          let j = i + 1;
          while (j < lines.length && !lines[j].includes(')')) {
            result.push(lines[j]);
            j++;
          }
          if (j < lines.length) result.push(lines[j]);
          i = j + 1;
          continue;
        }
        i++;
        continue;
      }

      // Types & Structs
      if (/^type\s+[A-Za-z0-9_]+\s+(?:struct|interface)/.test(trimmed)) {
        const sym = symbols.find((s) => s.startLine === i + 1);
        if (sym) preservedSymbols.push(sym.name);
        const endLine = this.skipBraceBlock(lines, i);
        for (let j = i; j < endLine && j < lines.length; j++) {
          result.push(lines[j]);
        }
        i = endLine;
        continue;
      }

      // Functions & Methods
      const funcMatch = trimmed.match(/^func\s+(?:\(([^)]+)\)\s+)?([A-Za-z0-9_]+)\s*\([^)]*\)(?:\s*(?:\([^)]+\)|[^{]+))?\s*\{/);
      if (funcMatch) {
        const name = funcMatch[2];
        preservedSymbols.push(name);
        const sig = trimmed.replace(/\s*\{.*$/, '');
        result.push(`${sig} { ${replacement} }`);
        i = this.skipBraceBlock(lines, i);
        continue;
      }

      i++;
    }

    return result;
  }

  /* -------------------------------------------------------------
   * Rust Pruning
   * ------------------------------------------------------------- */
  private pruneRustLines(
    lines: string[],
    symbols: import('./types.js').AstSymbol[],
    replacement: string,
    preservedSymbols: string[]
  ): string[] {
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Use statements
      if (trimmed.startsWith('use ') || trimmed.startsWith('pub use ')) {
        result.push(line);
        i++;
        continue;
      }

      // Structs, Enums, Traits
      if (/^(?:pub(?:\([^)]+\))?\s+)?(?:struct|enum|trait)\s+[A-Za-z0-9_]+/.test(trimmed)) {
        const sym = symbols.find((s) => s.startLine === i + 1);
        if (sym) preservedSymbols.push(sym.name);
        if (trimmed.includes(';') && !trimmed.includes('{')) {
          result.push(line);
          i++;
          continue;
        }
        const endLine = this.skipBraceBlock(lines, i);
        for (let j = i; j < endLine && j < lines.length; j++) {
          result.push(lines[j]);
        }
        i = endLine;
        continue;
      }

      // Functions
      const fnMatch = trimmed.match(/^(?:pub(?:\([^)]+\))?\s+)?(?:async\s+)?fn\s+([A-Za-z0-9_]+)\s*(?:<[^>]+>)?\s*\([^)]*\)(?:\s*->\s*[^{;]+)?(?:\s*\{)?/);
      if (fnMatch) {
        const name = fnMatch[1];
        preservedSymbols.push(name);
        const sig = trimmed.replace(/\s*\{.*$/, '');
        result.push(`${sig} { ${replacement} }`);
        i = this.skipBraceBlock(lines, i);
        continue;
      }

      i++;
    }

    return result;
  }

  /* -------------------------------------------------------------
   * Generic Unknown Language Pruning
   * ------------------------------------------------------------- */
  private pruneGenericLines(
    lines: string[],
    replacement: string,
    preservedSymbols: string[]
  ): string[] {
    const result: string[] = [];
    let inBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
        result.push(line);
      } else if (trimmed.includes('{') && !inBlock) {
        result.push(line.split('{')[0] + `{ ${replacement} }`);
        inBlock = true;
      } else if (trimmed.includes('}') && inBlock) {
        inBlock = false;
      } else if (!inBlock && trimmed.length > 0) {
        result.push(line);
      }
    }
    return result;
  }

  /* -------------------------------------------------------------
   * Block Navigation
   * ------------------------------------------------------------- */
  private skipBraceBlock(lines: string[], startIdx: number): number {
    let braceCount = 0;
    let foundInitial = false;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          foundInitial = true;
        } else if (char === '}') {
          braceCount--;
        }
      }
      if (foundInitial && braceCount <= 0) {
        return i + 1;
      }
    }
    return lines.length;
  }

  private skipPythonBlock(lines: string[], startIdx: number): number {
    const baseLine = lines[startIdx];
    const baseIndent = baseLine.length - baseLine.trimStart().length;

    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().length === 0) continue;
      const indent = line.length - line.trimStart().length;
      if (indent <= baseIndent) {
        return i;
      }
    }
    return lines.length;
  }
}
