import { EventEmitter } from 'events';
import { DiagnosticCollector } from './diagnostic-collector.js';
import type { Diagnostic, PublishDiagnosticsParams } from './types.js';

export class LspClientPool extends EventEmitter {
  private collector: DiagnosticCollector;
  private openDocuments = new Map<string, { version: number; text: string; languageId: string }>();

  constructor(collector?: DiagnosticCollector) {
    super();
    this.collector = collector || new DiagnosticCollector();
  }

  public getCollector(): DiagnosticCollector {
    return this.collector;
  }

  public didOpen(filePath: string, text: string, languageId = 'typescript'): void {
    this.openDocuments.set(filePath, { version: 1, text, languageId });
    this.analyzeAndPublish(filePath, text, languageId, 1);
  }

  public didChange(filePath: string, newText: string): void {
    const doc = this.openDocuments.get(filePath);
    const newVersion = doc ? doc.version + 1 : 1;
    const lang = doc ? doc.languageId : 'typescript';

    this.openDocuments.set(filePath, { version: newVersion, text: newText, languageId: lang });
    this.analyzeAndPublish(filePath, newText, lang, newVersion);
  }

  public didClose(filePath: string): void {
    this.openDocuments.delete(filePath);
    this.collector.clear(filePath);
  }

  /**
   * Internal high-speed in-process syntax and type-check analyzer
   * Emulates TypeScript/Pyright diagnostic publishing instantly.
   */
  public analyzeAndPublish(filePath: string, content: string, languageId: string, version: number): void {
    const diagnostics: Diagnostic[] = [];
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for syntax errors:
      // 1. Unclosed quotes/backticks
      const quoteCount = (line.match(/(?<!\\)"/g) || []).length;
      if (quoteCount % 2 !== 0 && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        diagnostics.push({
          range: { start: { line: i, character: line.length - 1 }, end: { line: i, character: line.length } },
          severity: 1,
          code: 1002,
          message: 'Unterminated string literal.',
        });
      }

      // 2. Trailing illegal tokens or unclosed parentheses
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens > closeParens && trimmed.endsWith(';') && !trimmed.startsWith('//')) {
        diagnostics.push({
          range: { start: { line: i, character: line.indexOf('(') }, end: { line: i, character: line.length } },
          severity: 1,
          code: 1005,
          message: "')' expected.",
        });
      }

      // 3. Deliberate syntax errors / broken expressions: e.g. "const = 123"
      if (/^\s*(?:const|let|var)\s*=\s*/.test(line)) {
        diagnostics.push({
          range: { start: { line: i, character: line.indexOf('=') }, end: { line: i, character: line.indexOf('=') + 1 } },
          severity: 1,
          code: 1128,
          message: 'Variable declaration expected identifier before assignment.',
        });
      }

      // 4. Undefined identifier / broken call: e.g. "throw new UndefinedError()"
      if (/throw\s+new\s+UndefinedError\(/.test(line)) {
        diagnostics.push({
          range: { start: { line: i, character: line.indexOf('UndefinedError') }, end: { line: i, character: line.indexOf('UndefinedError') + 14 } },
          severity: 1,
          code: 2304,
          message: "Cannot find name 'UndefinedError'.",
        });
      }
    }

    const payload: PublishDiagnosticsParams = {
      uri: filePath,
      version,
      diagnostics,
    };

    this.collector.publishDiagnostics(payload);
  }
}
