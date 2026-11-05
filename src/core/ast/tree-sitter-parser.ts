import type {
  AstReference,
  AstSymbol,
  CstNode,
  ParsedSourceFile,
  SupportedLanguage,
  SymbolKind,
} from './types.js';

export interface ParserOptions {
  enableCache?: boolean;
}

export class TreeSitterParser {
  private cache = new Map<string, { hash: string; parsed: ParsedSourceFile }>();
  private enableCache: boolean;

  constructor(options: ParserOptions = {}) {
    this.enableCache = options.enableCache ?? true;
  }

  public detectLanguage(filePath: string): SupportedLanguage {
    const ext = filePath.toLowerCase().split('.').pop() || '';
    switch (ext) {
      case 'ts':
      case 'tsx':
      case 'mts':
      case 'cts':
        return 'typescript';
      case 'js':
      case 'jsx':
      case 'mjs':
      case 'cjs':
        return 'javascript';
      case 'py':
      case 'pyw':
        return 'python';
      case 'go':
        return 'go';
      case 'rs':
        return 'rust';
      default:
        return 'unknown';
    }
  }

  public parse(
    filePath: string,
    content: string,
    explicitLang?: SupportedLanguage
  ): ParsedSourceFile {
    const startTime = performance.now();
    const language = explicitLang ?? this.detectLanguage(filePath);
    const contentHash = this.computeHash(content);

    if (this.enableCache) {
      const cached = this.cache.get(filePath);
      if (cached && cached.hash === contentHash) {
        return {
          ...cached.parsed,
          parseDurationMs: performance.now() - startTime,
        };
      }
    }

    const lines = content.split(/\r?\n/);
    const loc = lines.length;

    let symbols: AstSymbol[] = [];
    let references: AstReference[] = [];
    let rootNode: CstNode;

    switch (language) {
      case 'typescript':
      case 'javascript':
        ({ symbols, references, rootNode } = this.parseTypeScript(content, lines, filePath, language));
        break;
      case 'python':
        ({ symbols, references, rootNode } = this.parsePython(content, lines, filePath));
        break;
      case 'go':
        ({ symbols, references, rootNode } = this.parseGo(content, lines, filePath));
        break;
      case 'rust':
        ({ symbols, references, rootNode } = this.parseRust(content, lines, filePath));
        break;
      default:
        ({ symbols, references, rootNode } = this.parseUnknown(content, lines, filePath));
        break;
    }

    const duration = performance.now() - startTime;
    const parsed: ParsedSourceFile = {
      filePath,
      language,
      loc,
      parseDurationMs: Number(duration.toFixed(3)),
      symbols,
      references,
      rootNode,
    };

    if (this.enableCache) {
      this.cache.set(filePath, { hash: contentHash, parsed });
    }

    return parsed;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  private computeHash(text: string): string {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) + hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /* -------------------------------------------------------------
   * TypeScript & JavaScript CST & Symbol Parsing
   * ------------------------------------------------------------- */
  private parseTypeScript(
    content: string,
    lines: string[],
    filePath: string,
    lang: SupportedLanguage
  ): { symbols: AstSymbol[]; references: AstReference[]; rootNode: CstNode } {
    const symbols: AstSymbol[] = [];
    const references: AstReference[] = [];
    const children: CstNode[] = [];

    // Parse Imports & References
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // import { X, Y as Z } from './foo'
      const namedImport = line.match(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/);
      if (namedImport) {
        const importedList = namedImport[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]);
        for (const imp of importedList) {
          if (imp) {
            references.push({
              sourceSymbol: '<module>',
              targetSymbol: imp,
              kind: 'import',
              filePath,
              line: i + 1,
            });
          }
        }
      }

      // import DefaultSymbol from '...'
      const defaultImport = line.match(/import\s+([A-Za-z0-9_$]+)\s+from\s*['"]([^'"]+)['"]/);
      if (defaultImport && !trimmed.includes('{')) {
        references.push({
          sourceSymbol: '<module>',
          targetSymbol: defaultImport[1],
          kind: 'import',
          filePath,
          line: i + 1,
        });
      }

      // Calls: ident(...)
      const callMatches = line.matchAll(/([A-Za-z0-9_$]+)\s*\(/g);
      for (const m of callMatches) {
        const called = m[1];
        if (!['if', 'for', 'while', 'switch', 'catch', 'function', 'import', 'super'].includes(called)) {
          references.push({
            sourceSymbol: '<module>',
            targetSymbol: called,
            kind: 'call',
            filePath,
            line: i + 1,
          });
        }
      }

      // Type references: : TypeName or <TypeName> or extends TypeName or implements TypeName
      const typeMatches = line.matchAll(/(?::\s*|<|extends\s+|implements\s+)([A-Z][A-Za-z0-9_$]+)/g);
      for (const m of typeMatches) {
        references.push({
          sourceSymbol: '<module>',
          targetSymbol: m[1],
          kind: 'type-reference',
          filePath,
          line: i + 1,
        });
      }
    }

    // Parse Definitions (functions, interfaces, classes, types, enums)
    let currentIdx = 0;
    while (currentIdx < lines.length) {
      const line = lines[currentIdx];
      const trimmed = line.trim();

      // Interface
      const ifaceMatch = trimmed.match(/^(?:export\s+)?interface\s+([A-Za-z0-9_$]+)(?:\s+extends\s+([A-Za-z0-9_$,\s]+))?/);
      if (ifaceMatch) {
        const isExported = trimmed.startsWith('export');
        const name = ifaceMatch[1];
        const extendsClause = ifaceMatch[2];
        const startLine = currentIdx + 1;
        const endLine = this.findClosingBrace(lines, currentIdx);
        const bodyLines = lines.slice(currentIdx, endLine);
        const signature = lines[currentIdx].trim().replace(/\s*\{.*$/, '');

        if (extendsClause) {
          const parents = extendsClause.split(',').map((s) => s.trim());
          for (const p of parents) {
            references.push({
              sourceSymbol: name,
              targetSymbol: p,
              kind: 'extends',
              filePath,
              line: startLine,
            });
          }
        }

        const sym: AstSymbol = {
          name,
          kind: 'interface',
          isExported,
          startLine,
          endLine,
          signature,
          body: bodyLines.join('\n'),
        };
        symbols.push(sym);
        children.push({
          type: 'interface_declaration',
          text: sym.body || signature,
          startLine,
          endLine,
          children: [],
        });
        currentIdx = endLine;
        continue;
      }

      // Type Alias
      const typeMatch = trimmed.match(/^(?:export\s+)?type\s+([A-Za-z0-9_$]+)(?:<[^>]+>)?\s*=/);
      if (typeMatch) {
        const isExported = trimmed.startsWith('export');
        const name = typeMatch[1];
        const startLine = currentIdx + 1;
        let endLine = currentIdx + 1;
        let body = line;
        while (endLine <= lines.length && !lines[endLine - 1].includes(';')) {
          endLine++;
        }
        body = lines.slice(currentIdx, endLine).join('\n');
        const sym: AstSymbol = {
          name,
          kind: 'type',
          isExported,
          startLine,
          endLine,
          signature: body.replace(/;$/, '').trim(),
          body,
        };
        symbols.push(sym);
        children.push({
          type: 'type_alias_declaration',
          text: body,
          startLine,
          endLine,
          children: [],
        });
        currentIdx = endLine;
        continue;
      }

      // Class
      const classMatch = trimmed.match(/^(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_$]+)(?:\s+extends\s+([A-Za-z0-9_$]+))?(?:\s+implements\s+([A-Za-z0-9_$,\s]+))?/);
      if (classMatch) {
        const isExported = trimmed.startsWith('export');
        const name = classMatch[1];
        const extendsClause = classMatch[2];
        const implementsClause = classMatch[3];
        const startLine = currentIdx + 1;
        const endLine = this.findClosingBrace(lines, currentIdx);
        const bodyLines = lines.slice(currentIdx, endLine);
        const signature = lines[currentIdx].trim().replace(/\s*\{.*$/, '');

        if (extendsClause) {
          references.push({
            sourceSymbol: name,
            targetSymbol: extendsClause.trim(),
            kind: 'extends',
            filePath,
            line: startLine,
          });
        }

        if (implementsClause) {
          const interfaces = implementsClause.split(',').map((s) => s.trim());
          for (const iface of interfaces) {
            references.push({
              sourceSymbol: name,
              targetSymbol: iface,
              kind: 'implements',
              filePath,
              line: startLine,
            });
          }
        }

        const sym: AstSymbol = {
          name,
          kind: 'class',
          isExported,
          startLine,
          endLine,
          signature,
          body: bodyLines.join('\n'),
        };
        symbols.push(sym);

        // Parse methods inside class
        for (let mIdx = currentIdx + 1; mIdx < endLine - 1; mIdx++) {
          const mLine = lines[mIdx].trim();
          const methodMatch = mLine.match(/^(?:public\s+|private\s+|protected\s+|static\s+|async\s+)*(?:get\s+|set\s+)?([A-Za-z0-9_$]+)\s*\([^)]*\)(?:\s*:\s*[^{;]+)?\s*\{/);
          if (methodMatch && !['constructor', 'if', 'for', 'while', 'switch'].includes(methodMatch[1])) {
            const mName = methodMatch[1];
            const mEnd = this.findClosingBrace(lines, mIdx);
            symbols.push({
              name: `${name}.${mName}`,
              kind: 'method',
              isExported: false,
              startLine: mIdx + 1,
              endLine: mEnd,
              signature: mLine.replace(/\s*\{.*$/, '').trim(),
              body: lines.slice(mIdx, mEnd).join('\n'),
            });
            mIdx = mEnd - 1;
          }
        }

        children.push({
          type: 'class_declaration',
          text: sym.body || signature,
          startLine,
          endLine,
          children: [],
        });
        currentIdx = endLine;
        continue;
      }

      // Function
      const funcMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\([^)]*\)(?:\s*:\s*[^{;]+)?(?:\s*\{)?/);
      if (funcMatch) {
        const isExported = trimmed.startsWith('export');
        const name = funcMatch[1];
        const startLine = currentIdx + 1;
        const endLine = this.findClosingBrace(lines, currentIdx);
        const signature = lines[currentIdx].trim().replace(/\s*\{.*$/, '');
        const body = lines.slice(currentIdx, endLine).join('\n');

        const sym: AstSymbol = {
          name,
          kind: 'function',
          isExported,
          startLine,
          endLine,
          signature,
          body,
        };
        symbols.push(sym);
        children.push({
          type: 'function_declaration',
          text: body,
          startLine,
          endLine,
          children: [],
        });
        currentIdx = endLine;
        continue;
      }

      // Arrow function: const/let foo = (...) => ...
      const arrowMatch = trimmed.match(/^(?:export\s+)?(?:const|let)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)(?:\s*:\s*[^{=>]+)?\s*=>/);
      if (arrowMatch) {
        const isExported = trimmed.startsWith('export');
        const name = arrowMatch[1];
        const startLine = currentIdx + 1;
        let endLine = currentIdx + 1;
        if (line.includes('{')) {
          endLine = this.findClosingBrace(lines, currentIdx);
        } else {
          while (endLine <= lines.length && !lines[endLine - 1].includes(';')) {
            endLine++;
          }
        }
        const signature = lines[currentIdx].trim().split('=>')[0].trim() + ' => ...';
        const body = lines.slice(currentIdx, endLine).join('\n');
        symbols.push({
          name,
          kind: 'function',
          isExported,
          startLine,
          endLine,
          signature,
          body,
        });
        children.push({
          type: 'arrow_function_declaration',
          text: body,
          startLine,
          endLine,
          children: [],
        });
        currentIdx = endLine;
        continue;
      }

      // Enum
      const enumMatch = trimmed.match(/^(?:export\s+)?enum\s+([A-Za-z0-9_$]+)/);
      if (enumMatch) {
        const isExported = trimmed.startsWith('export');
        const name = enumMatch[1];
        const startLine = currentIdx + 1;
        const endLine = this.findClosingBrace(lines, currentIdx);
        const body = lines.slice(currentIdx, endLine).join('\n');
        symbols.push({
          name,
          kind: 'enum',
          isExported,
          startLine,
          endLine,
          signature: lines[currentIdx].trim().replace(/\s*\{.*$/, ''),
          body,
        });
        children.push({
          type: 'enum_declaration',
          text: body,
          startLine,
          endLine,
          children: [],
        });
        currentIdx = endLine;
        continue;
      }

      currentIdx++;
    }

    const rootNode: CstNode = {
      type: 'program',
      text: content,
      startLine: 1,
      endLine: lines.length,
      children,
    };

    return { symbols, references, rootNode };
  }

  /* -------------------------------------------------------------
   * Python CST & Symbol Parsing
   * ------------------------------------------------------------- */
  private parsePython(
    content: string,
    lines: string[],
    filePath: string
  ): { symbols: AstSymbol[]; references: AstReference[]; rootNode: CstNode } {
    const symbols: AstSymbol[] = [];
    const references: AstReference[] = [];
    const children: CstNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Imports
      const importMatch = trimmed.match(/^import\s+([A-Za-z0-9_,\s]+)/);
      if (importMatch) {
        const modules = importMatch[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]);
        for (const m of modules) {
          if (m) references.push({ sourceSymbol: '<module>', targetSymbol: m, kind: 'import', filePath, line: i + 1 });
        }
      }
      const fromImportMatch = trimmed.match(/^from\s+([A-Za-z0-9_.]+)\s+import\s+([A-Za-z0-9_*,\s]+)/);
      if (fromImportMatch) {
        const names = fromImportMatch[2].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]);
        for (const n of names) {
          if (n) references.push({ sourceSymbol: '<module>', targetSymbol: n, kind: 'import', filePath, line: i + 1 });
        }
      }

      // Calls
      const callMatches = line.matchAll(/([A-Za-z0-9_]+)\s*\(/g);
      for (const m of callMatches) {
        const called = m[1];
        if (!['if', 'elif', 'while', 'for', 'def', 'class', 'with', 'return', 'print'].includes(called)) {
          references.push({ sourceSymbol: '<module>', targetSymbol: called, kind: 'call', filePath, line: i + 1 });
        }
      }
    }

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      const indent = line.length - line.trimStart().length;

      // Class definition: class ClassName(Base):
      const classMatch = trimmed.match(/^class\s+([A-Za-z0-9_]+)(?:\(([^)]*)\))?:/);
      if (classMatch && indent === 0) {
        const name = classMatch[1];
        const baseClass = classMatch[2]?.trim();
        const startLine = i + 1;
        const endLine = this.findPythonBlockEnd(lines, i);
        const signature = trimmed.replace(/:$/, '');
        const body = lines.slice(i, endLine).join('\n');

        if (baseClass) {
          const bases = baseClass.split(',').map((s) => s.trim());
          for (const b of bases) {
            references.push({ sourceSymbol: name, targetSymbol: b, kind: 'extends', filePath, line: startLine });
          }
        }

        symbols.push({
          name,
          kind: 'class',
          isExported: !name.startsWith('_'),
          startLine,
          endLine,
          signature,
          body,
        });

        // Scan methods inside class
        for (let m = i + 1; m < endLine; m++) {
          const mLine = lines[m];
          const mTrimmed = mLine.trim();
          const mIndent = mLine.length - mLine.trimStart().length;
          const methodMatch = mTrimmed.match(/^(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/);
          if (methodMatch && mIndent > 0) {
            const mName = methodMatch[1];
            const mEnd = this.findPythonBlockEnd(lines, m);
            symbols.push({
              name: `${name}.${mName}`,
              kind: 'method',
              isExported: !mName.startsWith('_'),
              startLine: m + 1,
              endLine: mEnd,
              signature: mTrimmed.replace(/:$/, ''),
              body: lines.slice(m, mEnd).join('\n'),
            });
            m = mEnd - 1;
          }
        }

        children.push({ type: 'class_definition', text: body, startLine, endLine, children: [] });
        i = endLine;
        continue;
      }

      // Top-level Function: def func(...): or async def func(...):
      const funcMatch = trimmed.match(/^(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/);
      if (funcMatch && indent === 0) {
        const name = funcMatch[1];
        const startLine = i + 1;
        const endLine = this.findPythonBlockEnd(lines, i);
        const signature = trimmed.replace(/:$/, '');
        const body = lines.slice(i, endLine).join('\n');

        symbols.push({
          name,
          kind: 'function',
          isExported: !name.startsWith('_'),
          startLine,
          endLine,
          signature,
          body,
        });
        children.push({ type: 'function_definition', text: body, startLine, endLine, children: [] });
        i = endLine;
        continue;
      }

      i++;
    }

    const rootNode: CstNode = {
      type: 'module',
      text: content,
      startLine: 1,
      endLine: lines.length,
      children,
    };

    return { symbols, references, rootNode };
  }

  /* -------------------------------------------------------------
   * Go CST & Symbol Parsing
   * ------------------------------------------------------------- */
  private parseGo(
    content: string,
    lines: string[],
    filePath: string
  ): { symbols: AstSymbol[]; references: AstReference[]; rootNode: CstNode } {
    const symbols: AstSymbol[] = [];
    const references: AstReference[] = [];
    const children: CstNode[] = [];

    // Parse Imports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const singleImport = trimmed.match(/^import\s+["']([^"']+)["']/);
      if (singleImport) {
        const parts = singleImport[1].split('/');
        references.push({ sourceSymbol: '<package>', targetSymbol: parts[parts.length - 1], kind: 'import', filePath, line: i + 1 });
      }
      if (trimmed === 'import (') {
        let j = i + 1;
        while (j < lines.length && !lines[j].includes(')')) {
          const m = lines[j].trim().match(/["']([^"']+)["']/);
          if (m) {
            const parts = m[1].split('/');
            references.push({ sourceSymbol: '<package>', targetSymbol: parts[parts.length - 1], kind: 'import', filePath, line: j + 1 });
          }
          j++;
        }
      }

      // Calls
      const callMatches = line.matchAll(/([A-Za-z0-9_]+)\s*\(/g);
      for (const m of callMatches) {
        const called = m[1];
        if (!['if', 'for', 'switch', 'func', 'return', 'make', 'len', 'append'].includes(called)) {
          references.push({ sourceSymbol: '<package>', targetSymbol: called, kind: 'call', filePath, line: i + 1 });
        }
      }
    }

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Go Struct or Interface: type Foo struct / type Bar interface
      const typeDefMatch = trimmed.match(/^type\s+([A-Za-z0-9_]+)\s+(struct|interface)/);
      if (typeDefMatch) {
        const name = typeDefMatch[1];
        const kind = typeDefMatch[2] === 'interface' ? 'interface' : 'class';
        const isExported = /^[A-Z]/.test(name);
        const startLine = i + 1;
        const endLine = this.findClosingBrace(lines, i);
        const body = lines.slice(i, endLine).join('\n');
        const signature = trimmed.replace(/\s*\{.*$/, '');

        symbols.push({
          name,
          kind: kind as SymbolKind,
          isExported,
          startLine,
          endLine,
          signature,
          body,
        });
        children.push({ type: `${kind}_declaration`, text: body, startLine, endLine, children: [] });
        i = endLine;
        continue;
      }

      // Go Function or Method: func FuncName(...) or func (r *Receiver) MethodName(...)
      const funcMatch = trimmed.match(/^func\s+(?:\(([^)]+)\)\s+)?([A-Za-z0-9_]+)\s*\(([^)]*)\)(?:\s*(?:\([^)]+\)|[^{]+))?\s*\{/);
      if (funcMatch) {
        const receiver = funcMatch[1]?.trim();
        const rawName = funcMatch[2];
        const isExported = /^[A-Z]/.test(rawName);
        const isMethod = !!receiver;
        const receiverType = receiver ? receiver.split(/\s+/).pop()?.replace(/^\*/, '') : '';
        const name = isMethod && receiverType ? `${receiverType}.${rawName}` : rawName;
        const startLine = i + 1;
        const endLine = this.findClosingBrace(lines, i);
        const signature = trimmed.replace(/\s*\{.*$/, '');
        const body = lines.slice(i, endLine).join('\n');

        symbols.push({
          name,
          kind: isMethod ? 'method' : 'function',
          isExported,
          startLine,
          endLine,
          signature,
          body,
        });
        children.push({ type: 'function_declaration', text: body, startLine, endLine, children: [] });
        i = endLine;
        continue;
      }

      i++;
    }

    const rootNode: CstNode = {
      type: 'source_file',
      text: content,
      startLine: 1,
      endLine: lines.length,
      children,
    };

    return { symbols, references, rootNode };
  }

  /* -------------------------------------------------------------
   * Rust CST & Symbol Parsing
   * ------------------------------------------------------------- */
  private parseRust(
    content: string,
    lines: string[],
    filePath: string
  ): { symbols: AstSymbol[]; references: AstReference[]; rootNode: CstNode } {
    const symbols: AstSymbol[] = [];
    const references: AstReference[] = [];
    const children: CstNode[] = [];

    // Parse Use statements & Calls
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const useMatch = trimmed.match(/^pub\s+use\s+([^;]+);|^use\s+([^;]+);/);
      if (useMatch) {
        const raw = useMatch[1] || useMatch[2];
        const parts = raw.split('::');
        const target = parts[parts.length - 1].replace(/[{}]/g, '').trim();
        references.push({ sourceSymbol: '<crate>', targetSymbol: target, kind: 'import', filePath, line: i + 1 });
      }

      const callMatches = line.matchAll(/([A-Za-z0-9_]+)\s*\(/g);
      for (const m of callMatches) {
        const called = m[1];
        if (!['if', 'match', 'while', 'for', 'fn', 'println', 'vec', 'Some', 'Ok', 'Err'].includes(called)) {
          references.push({ sourceSymbol: '<crate>', targetSymbol: called, kind: 'call', filePath, line: i + 1 });
        }
      }
    }

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Rust Struct or Enum
      const structEnumMatch = trimmed.match(/^(pub(?:\([^)]+\))?\s+)?(struct|enum|trait)\s+([A-Za-z0-9_]+)/);
      if (structEnumMatch) {
        const isExported = !!structEnumMatch[1];
        const kind = structEnumMatch[2] === 'enum' ? 'enum' : structEnumMatch[2] === 'trait' ? 'interface' : 'class';
        const name = structEnumMatch[3];
        const startLine = i + 1;
        const endLine = line.includes(';') ? startLine : this.findClosingBrace(lines, i);
        const signature = trimmed.replace(/\s*\{.*$/, '').replace(/;$/, '');
        const body = lines.slice(i, endLine).join('\n');

        symbols.push({
          name,
          kind: kind as SymbolKind,
          isExported,
          startLine,
          endLine,
          signature,
          body,
        });
        children.push({ type: `${structEnumMatch[2]}_item`, text: body, startLine, endLine, children: [] });
        i = endLine;
        continue;
      }

      // Rust Function: fn foo(...) or pub fn foo(...)
      const fnMatch = trimmed.match(/^(pub(?:\([^)]+\))?\s+)?(?:async\s+)?fn\s+([A-Za-z0-9_]+)\s*(?:<[^>]+>)?\s*\([^)]*\)(?:\s*->\s*[^{;]+)?(?:\s*\{)?/);
      if (fnMatch) {
        const isExported = !!fnMatch[1];
        const name = fnMatch[2];
        const startLine = i + 1;
        const endLine = this.findClosingBrace(lines, i);
        const signature = trimmed.replace(/\s*\{.*$/, '');
        const body = lines.slice(i, endLine).join('\n');

        symbols.push({
          name,
          kind: 'function',
          isExported,
          startLine,
          endLine,
          signature,
          body,
        });
        children.push({ type: 'function_item', text: body, startLine, endLine, children: [] });
        i = endLine;
        continue;
      }

      i++;
    }

    const rootNode: CstNode = {
      type: 'source_file',
      text: content,
      startLine: 1,
      endLine: lines.length,
      children,
    };

    return { symbols, references, rootNode };
  }

  /* -------------------------------------------------------------
   * Fallback for Unknown Languages (Text Chunking)
   * ------------------------------------------------------------- */
  private parseUnknown(
    content: string,
    lines: string[],
    filePath: string
  ): { symbols: AstSymbol[]; references: AstReference[]; rootNode: CstNode } {
    const symbols: AstSymbol[] = [];
    const references: AstReference[] = [];
    const children: CstNode[] = [];

    let currentChunkStart = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '' || i === lines.length - 1) {
        const chunkLines = lines.slice(currentChunkStart, i + 1);
        const text = chunkLines.join('\n').trim();
        if (text.length > 0) {
          const chunkNode: CstNode = {
            type: 'text_chunk',
            text,
            startLine: currentChunkStart + 1,
            endLine: i + 1,
            children: [],
          };
          children.push(chunkNode);
        }
        currentChunkStart = i + 1;
      }
    }

    return {
      symbols,
      references,
      rootNode: {
        type: 'raw_file',
        text: content,
        startLine: 1,
        endLine: lines.length,
        children,
      },
    };
  }

  /* -------------------------------------------------------------
   * Bracket / Indentation Navigation Helpers
   * ------------------------------------------------------------- */
  private findClosingBrace(lines: string[], startIdx: number): number {
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

  private findPythonBlockEnd(lines: string[], startIdx: number): number {
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
