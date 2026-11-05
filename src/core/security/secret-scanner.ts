import { SECRET_RULES } from './rules.js';
import { ShannonEntropy } from './entropy.js';
import type { DetectedSecret } from './types.js';

export class SecretScanner {
  public static scan(text: string): DetectedSecret[] {
    const detections: DetectedSecret[] = [];
    let counter = 1;

    // 1. Scan deterministic regex rules
    for (const rule of SECRET_RULES) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const val = match[0];
        const entropy = ShannonEntropy.calculate(val);
        detections.push({
          ruleId: rule.id,
          ruleName: rule.name,
          matchedValue: val,
          entropy,
          startIndex: match.index,
          endIndex: match.index + val.length,
          pseudonymToken: `{{${rule.tokenPrefix}_${counter++}}}`,
        });
      }
    }

    // 2. Scan high-entropy generic tokens (e.g., in .env assignments)
    const highEntropyTokens = ShannonEntropy.findHighEntropyTokens(text, 4.5);
    for (const item of highEntropyTokens) {
      // Avoid duplicating if already matched by specific rules
      if (!detections.some((d) => d.matchedValue.includes(item.token) || item.token.includes(d.matchedValue))) {
        const idx = text.indexOf(item.token);
        if (idx !== -1) {
          detections.push({
            ruleId: 'high-entropy-secret',
            ruleName: 'High-Entropy Secret Value',
            matchedValue: item.token,
            entropy: item.entropy,
            startIndex: idx,
            endIndex: idx + item.token.length,
            pseudonymToken: `{{ONYX_REDACTED_HIGH_ENTROPY_SECRET_${counter++}}}`,
          });
        }
      }
    }

    return detections;
  }
}
