import type { SaveParticipantOptions } from './types.js';

export class SaveParticipantsPipeline {
  private options: SaveParticipantOptions;

  constructor(options: SaveParticipantOptions = {}) {
    this.options = {
      formatOnSave: true,
      organizeImports: true,
      trimTrailingWhitespace: true,
      insertFinalNewline: true,
      timeoutMs: 1500,
      ...options,
    };
  }

  public async executePipeline(
    filePath: string,
    initialContent: string
  ): Promise<{ content: string; executedHooks: string[] }> {
    let content = initialContent;
    const executedHooks: string[] = [];

    // Timeout guard: 1500ms
    const timeout = this.options.timeoutMs || 1500;
    const startTime = performance.now();

    // 1. Trim trailing whitespace
    if (this.options.trimTrailingWhitespace) {
      content = content
        .split(/\r?\n/)
        .map((l) => l.replace(/\s+$/, ''))
        .join('\n');
      executedHooks.push('trimTrailingWhitespace');
    }

    // 2. Organize imports
    if (this.options.organizeImports) {
      content = this.organizeImports(content);
      executedHooks.push('organizeImports');
    }

    // 3. Insert final newline
    if (this.options.insertFinalNewline) {
      if (!content.endsWith('\n')) {
        content += '\n';
      }
      executedHooks.push('insertFinalNewline');
    }

    if (performance.now() - startTime > timeout) {
      throw new Error(`SaveParticipant timeout exceeded (${timeout}ms)`);
    }

    return { content, executedHooks };
  }

  private organizeImports(content: string): string {
    const lines = content.split(/\r?\n/);
    const importLines: string[] = [];
    const otherLines: string[] = [];

    let inImports = true;
    for (const line of lines) {
      if (inImports && line.startsWith('import ')) {
        importLines.push(line);
      } else {
        if (importLines.length > 0) inImports = false;
        otherLines.push(line);
      }
    }

    if (importLines.length > 1) {
      // Sort imports alphabetically
      importLines.sort();
      return [...importLines, ...otherLines].join('\n');
    }

    return content;
  }
}
