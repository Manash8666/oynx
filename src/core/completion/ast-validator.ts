export class AstCompletionValidator {
  public static validateAndBalance(prefixLine: string, candidate: string): { valid: boolean; balanced: string } {
    const combined = prefixLine + candidate;

    let parens = 0;
    let braces = 0;
    let brackets = 0;

    for (const char of combined) {
      if (char === '(') parens++;
      if (char === ')') parens--;
      if (char === '{') braces++;
      if (char === '}') braces--;
      if (char === '[') brackets++;
      if (char === ']') brackets--;
    }

    // Catastrophic syntax break (more closing than opening)
    if (parens < 0 || braces < 0 || brackets < 0) {
      return { valid: false, balanced: candidate };
    }

    // Auto-balance missing closing brackets if needed
    let balanced = candidate;
    while (parens > 0) {
      balanced += ')';
      parens--;
    }
    while (brackets > 0) {
      balanced += ']';
      brackets--;
    }
    while (braces > 0) {
      balanced += '}';
      braces--;
    }

    return { valid: true, balanced };
  }
}
