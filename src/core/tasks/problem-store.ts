import { EventEmitter } from 'events';
import type { ExtractedProblem } from './types.js';

export class ProblemStore extends EventEmitter {
  private problemsByFile = new Map<string, ExtractedProblem[]>();

  public addProblems(problems: ExtractedProblem[]): void {
    for (const prob of problems) {
      const list = this.problemsByFile.get(prob.filePath) || [];
      list.push(prob);
      this.problemsByFile.set(prob.filePath, list);
    }
    this.emit('problemsUpdated', this.getAllProblems());
  }

  public clearProblemsForFile(filePath: string): void {
    this.problemsByFile.delete(filePath);
    this.emit('problemsUpdated', this.getAllProblems());
  }

  public clearAll(): void {
    this.problemsByFile.clear();
    this.emit('problemsUpdated', []);
  }

  public getProblemsForFile(filePath: string): ExtractedProblem[] {
    return this.problemsByFile.get(filePath) || [];
  }

  public getAllProblems(): ExtractedProblem[] {
    const all: ExtractedProblem[] = [];
    for (const list of this.problemsByFile.values()) {
      all.push(...list);
    }
    return all;
  }

  /**
   * Exposes workspace diagnostics directly to the AI agent
   */
  public getWorkspaceDiagnostics(): Array<{ file: string; line: number; message: string; severity: string }> {
    return this.getAllProblems().map((p) => ({
      file: p.filePath,
      line: p.line,
      message: p.message,
      severity: p.severity,
    }));
  }
}
