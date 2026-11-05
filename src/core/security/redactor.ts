import { SecretScanner } from './secret-scanner.js';
import type { RedactionResult } from './types.js';

export class SecretRedactor {
  private sessionTokenMap = new Map<string, string>();

  public redact(text: string): RedactionResult {
    const detections = SecretScanner.scan(text);
    const tokenMap = new Map<string, string>();

    if (detections.length === 0) {
      return {
        sanitizedText: text,
        secretsCount: 0,
        detections: [],
        tokenMap,
      };
    }

    // Sort detections by descending startIndex to avoid index shift during replacement
    const sortedDetections = [...detections].sort((a, b) => b.startIndex - a.startIndex);
    let sanitizedText = text;

    for (const d of sortedDetections) {
      sanitizedText =
        sanitizedText.substring(0, d.startIndex) +
        d.pseudonymToken +
        sanitizedText.substring(d.endIndex);

      tokenMap.set(d.pseudonymToken, d.matchedValue);
      this.sessionTokenMap.set(d.pseudonymToken, d.matchedValue);
    }

    return {
      sanitizedText,
      secretsCount: detections.length,
      detections,
      tokenMap,
    };
  }

  /**
   * Restore real local secrets into generated code before writing to physical disk
   */
  public restore(sanitizedText: string, customMap?: Map<string, string>): string {
    const map = customMap || this.sessionTokenMap;
    let restored = sanitizedText;

    for (const [pseudonym, realValue] of map.entries()) {
      restored = restored.split(pseudonym).join(realValue);
    }

    return restored;
  }

  public getSessionMap(): Map<string, string> {
    return this.sessionTokenMap;
  }

  public clearSession(): void {
    this.sessionTokenMap.clear();
  }
}
