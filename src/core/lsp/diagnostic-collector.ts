import { EventEmitter } from 'events';
import type { Diagnostic, LspErrorSummary, PublishDiagnosticsParams } from './types.js';

export class DiagnosticCollector extends EventEmitter {
  private diagnosticsByFile = new Map<string, Diagnostic[]>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private debounceMs: number;

  constructor(debounceMs = 250) {
    super();
    this.debounceMs = debounceMs;
  }

  public publishDiagnostics(params: PublishDiagnosticsParams): void {
    const filePath = this.normalizeUri(params.uri);

    // Debounce updates by 250ms
    const existing = this.debounceTimers.get(filePath);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.diagnosticsByFile.set(filePath, params.diagnostics);
      const errors = this.getErrors(filePath);
      this.emit('diagnosticsUpdated', { filePath, diagnostics: params.diagnostics, errors });
      if (errors.length > 0) {
        this.emit('errorsDetected', { filePath, errors });
      }
      this.debounceTimers.delete(filePath);
    }, this.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  public publishDiagnosticsSync(params: PublishDiagnosticsParams): void {
    const filePath = this.normalizeUri(params.uri);
    const existing = this.debounceTimers.get(filePath);
    if (existing) clearTimeout(existing);

    this.diagnosticsByFile.set(filePath, params.diagnostics);
    const errors = this.getErrors(filePath);
    this.emit('diagnosticsUpdated', { filePath, diagnostics: params.diagnostics, errors });
    if (errors.length > 0) {
      this.emit('errorsDetected', { filePath, errors });
    }
  }

  public getErrors(filePath: string): LspErrorSummary[] {
    const normalized = this.normalizeUri(filePath);
    const diagnostics = this.diagnosticsByFile.get(normalized) || [];

    // Filter severity === 1 (Error)
    return diagnostics
      .filter((d) => d.severity === 1)
      .map((d) => ({
        filePath: normalized,
        line: d.range.start.line + 1,
        column: d.range.start.character + 1,
        code: d.code,
        message: d.message,
      }));
  }

  public getAllErrors(): Map<string, LspErrorSummary[]> {
    const result = new Map<string, LspErrorSummary[]>();
    for (const [file, diags] of this.diagnosticsByFile.entries()) {
      const errors = diags
        .filter((d) => d.severity === 1)
        .map((d) => ({
          filePath: file,
          line: d.range.start.line + 1,
          column: d.range.start.character + 1,
          code: d.code,
          message: d.message,
        }));
      if (errors.length > 0) {
        result.set(file, errors);
      }
    }
    return result;
  }

  public clear(filePath?: string): void {
    if (filePath) {
      this.diagnosticsByFile.delete(this.normalizeUri(filePath));
    } else {
      this.diagnosticsByFile.clear();
    }
  }

  private normalizeUri(uri: string): string {
    return uri.replace(/^file:\/\/\/?/, '').replace(/\\/g, '/');
  }
}
