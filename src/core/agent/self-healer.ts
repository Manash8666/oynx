import type { DiagnosticCollector } from '../lsp/diagnostic-collector.js';
import type { HealingPassResult, LspErrorSummary } from '../lsp/types.js';

export class SelfHealer {
  private collector: DiagnosticCollector;
  private maxPasses: number;
  private currentPassesByTask = new Map<string, number>();

  constructor(collector: DiagnosticCollector, maxPasses = 3) {
    this.collector = collector;
    this.maxPasses = maxPasses;
  }

  public getErrorsForFiles(filePaths: string[]): Map<string, LspErrorSummary[]> {
    const errorMap = new Map<string, LspErrorSummary[]>();
    for (const file of filePaths) {
      const errs = this.collector.getErrors(file);
      if (errs.length > 0) {
        errorMap.set(file, errs);
      }
    }
    return errorMap;
  }

  public constructRemediationPrompt(
    filePath: string,
    errors: LspErrorSummary[],
    fileContent: string
  ): string {
    const lines = fileContent.split(/\r?\n/);
    const errorDescriptions = errors
      .map(
        (e) => `- Line ${e.line}, Col ${e.column}: [LSP Error TS${e.code || ''}] ${e.message}`
      )
      .join('\n');

    // Extract contextual window around the first error
    const firstError = errors[0];
    const startLine = Math.max(0, firstError.line - 3);
    const endLine = Math.min(lines.length, firstError.line + 3);
    const contextSnippet = lines
      .slice(startLine, endLine)
      .map((l, idx) => `${startLine + idx + 1}: ${l}`)
      .join('\n');

    return [
      `[LSP COMPILER SELF-HEALING REQUEST]`,
      `The file '${filePath}' contains ${errors.length} actionable compiler error(s):`,
      errorDescriptions,
      '',
      `Failing code context:`,
      contextSnippet,
      '',
      `Instructions: Provide an exact fix that resolves these compiler errors. Do NOT rewrite unrelated code.`,
    ].join('\n');
  }

  public async evaluateHealingPass(
    taskId: string,
    touchedFiles: string[],
    fileContents: Map<string, string>,
    patchApplier?: (filePath: string, fixPrompt: string) => Promise<boolean>
  ): Promise<HealingPassResult> {
    const currentPass = (this.currentPassesByTask.get(taskId) || 0) + 1;
    this.currentPassesByTask.set(taskId, currentPass);

    const errorMap = this.getErrorsForFiles(touchedFiles);
    const allErrors: LspErrorSummary[] = [];
    for (const errs of errorMap.values()) {
      allErrors.push(...errs);
    }

    if (allErrors.length === 0) {
      return {
        passNumber: currentPass,
        errorsDetected: [],
        healed: true,
        escalatedToUser: false,
      };
    }

    // Check if max passes reached
    if (currentPass >= this.maxPasses) {
      return {
        passNumber: currentPass,
        errorsDetected: allErrors,
        healed: false,
        escalatedToUser: true,
      };
    }

    // Construct prompt for first failing file
    const [firstFile, firstErrors] = Array.from(errorMap.entries())[0];
    const content = fileContents.get(firstFile) || '';
    const remediationPrompt = this.constructRemediationPrompt(firstFile, firstErrors, content);

    let healed = false;
    if (patchApplier) {
      healed = await patchApplier(firstFile, remediationPrompt);
    }

    return {
      passNumber: currentPass,
      errorsDetected: allErrors,
      remediationPrompt,
      healed,
      escalatedToUser: false,
    };
  }

  public resetTask(taskId: string): void {
    this.currentPassesByTask.delete(taskId);
  }
}
