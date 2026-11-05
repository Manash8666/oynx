import type { FuzzyMatchResult } from './types.js';

export class FuzzyMatcher {
  public static normalizeLine(line: string): string {
    return line.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\t/g, '  ');
  }

  public static similarity(a: string, b: string): number {
    const normA = this.normalizeLine(a);
    const normB = this.normalizeLine(b);

    if (normA === normB) return 1.0;
    if (normA.length === 0 || normB.length === 0) return 0.0;

    // Tokenized Jaccard similarity on alphanumeric tokens
    const tokensA = new Set(normA.split(/[^a-zA-Z0-9_$]+/));
    const tokensB = new Set(normB.split(/[^a-zA-Z0-9_$]+/));

    let intersection = 0;
    for (const t of tokensA) {
      if (tokensB.has(t)) intersection++;
    }

    const union = new Set([...tokensA, ...tokensB]).size;
    return union > 0 ? intersection / union : 0.0;
  }

  public static findMatch(
    fileLines: string[],
    searchLines: string[],
    startLineHint = 0,
    windowSize = 20,
    threshold = 0.75
  ): FuzzyMatchResult {
    if (searchLines.length === 0) {
      return { matched: false, startLine: 0, endLine: 0, confidence: 0, matchedText: '' };
    }

    const normalizedSearch = searchLines.map((l) => this.normalizeLine(l));
    const searchLen = normalizedSearch.length;

    // 1. Try exact line match at hinted position first
    if (startLineHint >= 0 && startLineHint + searchLen <= fileLines.length) {
      let exact = true;
      for (let i = 0; i < searchLen; i++) {
        if (this.normalizeLine(fileLines[startLineHint + i]) !== normalizedSearch[i]) {
          exact = false;
          break;
        }
      }
      if (exact) {
        return {
          matched: true,
          startLine: startLineHint,
          endLine: startLineHint + searchLen,
          confidence: 1.0,
          matchedText: fileLines.slice(startLineHint, startLineHint + searchLen).join('\n'),
        };
      }
    }

    // 2. Sliding window search across fileLines within windowSize around hint, then whole file
    let bestStart = -1;
    let bestConfidence = 0;

    for (let i = 0; i <= fileLines.length - searchLen; i++) {
      let scoreSum = 0;
      for (let j = 0; j < searchLen; j++) {
        scoreSum += this.similarity(fileLines[i + j], searchLines[j]);
      }
      const avgScore = scoreSum / searchLen;

      // Distance penalty if far from startLineHint
      const lineDist = Math.abs(i - startLineHint);
      const proximityBonus = lineDist <= windowSize ? 0.05 : 0;
      const finalScore = Math.min(1.0, avgScore + proximityBonus);

      if (finalScore > bestConfidence) {
        bestConfidence = finalScore;
        bestStart = i;
      }
    }

    if (bestConfidence >= threshold && bestStart !== -1) {
      return {
        matched: true,
        startLine: bestStart,
        endLine: bestStart + searchLen,
        confidence: Number(bestConfidence.toFixed(3)),
        matchedText: fileLines.slice(bestStart, bestStart + searchLen).join('\n'),
      };
    }

    return {
      matched: false,
      startLine: -1,
      endLine: -1,
      confidence: Number(bestConfidence.toFixed(3)),
      matchedText: '',
    };
  }
}
