export class ShannonEntropy {
  /**
   * Calculates Shannon Entropy H = - sum(p_i * log2(p_i))
   */
  public static calculate(str: string): number {
    if (!str || str.length === 0) return 0;

    const frequencies = new Map<string, number>();
    for (const char of str) {
      frequencies.set(char, (frequencies.get(char) || 0) + 1);
    }

    const len = str.length;
    let entropy = 0;

    for (const count of frequencies.values()) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }

    return Number(entropy.toFixed(3));
  }

  /**
   * Scans quoted assignments: const KEY = "..."
   */
  public static findHighEntropyTokens(text: string, threshold = 4.5): Array<{ token: string; entropy: number }> {
    const results: Array<{ token: string; entropy: number }> = [];
    const assignmentRegex = /(?:['"`])([A-Za-z0-9+/=_-]{16,})(?:['"`])/g;

    let match: RegExpExecArray | null;
    while ((match = assignmentRegex.exec(text)) !== null) {
      const candidate = match[1];
      const entropy = this.calculate(candidate);
      if (entropy >= threshold) {
        results.push({ token: candidate, entropy });
      }
    }

    return results;
  }
}
