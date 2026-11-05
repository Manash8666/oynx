import type { CompletionContextWindow, CursorPosition } from './types.js';

export class ContextWindowSlicer {
  public static slice(
    fileContent: string,
    cursor: CursorPosition,
    prefixCount = 20,
    suffixCount = 10
  ): CompletionContextWindow {
    const lines = fileContent.split(/\r?\n/);
    const lineIdx = Math.max(0, cursor.line - 1);

    const prefixStart = Math.max(0, lineIdx - prefixCount);
    const prefixLines = lines.slice(prefixStart, lineIdx);

    const activeLineText = lines[lineIdx] ? lines[lineIdx].substring(0, cursor.column - 1) : '';

    const suffixEnd = Math.min(lines.length, lineIdx + 1 + suffixCount);
    const suffixLines = lines.slice(lineIdx + 1, suffixEnd);

    // Extract identifiers in prefix
    const combinedPrefix = prefixLines.join('\n');
    const identifierMatches = combinedPrefix.matchAll(/\b([A-Za-z_$][A-Za-z0-9_$]{2,})\b/g);
    const scopeIdentifiers: string[] = [];

    for (const m of identifierMatches) {
      if (!scopeIdentifiers.includes(m[1]) && !['const', 'let', 'var', 'function', 'class', 'import', 'return'].includes(m[1])) {
        scopeIdentifiers.push(m[1]);
      }
    }

    return {
      prefixLines,
      suffixLines,
      activeLineText,
      scopeIdentifiers,
    };
  }
}
