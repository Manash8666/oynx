import type { AstChunk } from './types.js';

export class SqliteVectorStore {
  private chunks = new Map<string, AstChunk>();
  private vectors = new Map<string, number[]>();
  private invertedIndex = new Map<string, Set<string>>(); // token -> Set<chunkId>
  private docLengths = new Map<string, number>(); // chunkId -> totalTokens
  private avgDocLength = 0;

  public upsertChunk(chunk: AstChunk, vector?: number[]): void {
    this.chunks.set(chunk.id, chunk);

    if (vector) {
      this.vectors.set(chunk.id, vector);
    }

    // Tokenize chunk content for BM25
    const tokens = this.tokenize(chunk.content + ' ' + chunk.symbolName);
    this.docLengths.set(chunk.id, tokens.length);

    for (const t of tokens) {
      const set = this.invertedIndex.get(t) || new Set<string>();
      set.add(chunk.id);
      this.invertedIndex.set(t, set);
    }

    this.recomputeAvgDocLength();
  }

  public removeFileChunks(filePath: string): void {
    for (const [id, chunk] of this.chunks.entries()) {
      if (chunk.filePath === filePath) {
        this.chunks.delete(id);
        this.vectors.delete(id);
        this.docLengths.delete(id);
      }
    }
    this.recomputeAvgDocLength();
  }

  public getChunk(id: string): AstChunk | undefined {
    return this.chunks.get(id);
  }

  public getAllChunks(): AstChunk[] {
    return Array.from(this.chunks.values());
  }

  /**
   * BM25 score calculation:
   * score(D, Q) = sum( IDF(qi) * (f(qi, D) * (k1 + 1)) / (f(qi, D) + k1 * (1 - b + b * (|D| / avgdl))) )
   */
  public searchBM25(query: string, limit = 10): Array<{ chunk: AstChunk; score: number }> {
    const queryTokens = this.tokenize(query);
    const scores = new Map<string, number>();
    const N = this.chunks.size;
    const k1 = 1.5;
    const b = 0.75;

    for (const token of queryTokens) {
      const matchingDocs = this.invertedIndex.get(token);
      if (!matchingDocs) continue;

      const df = matchingDocs.size;
      const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);

      for (const docId of matchingDocs) {
        const chunk = this.chunks.get(docId)!;
        const docTokens = this.tokenize(chunk.content + ' ' + chunk.symbolName);
        const tf = docTokens.filter((t) => t === token).length;
        const dl = this.docLengths.get(docId) || 1;

        const termScore = idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / (this.avgDocLength || 1)))));
        scores.set(docId, (scores.get(docId) || 0) + termScore);
      }
    }

    return Array.from(scores.entries())
      .map(([id, score]) => ({ chunk: this.chunks.get(id)!, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Dense vector cosine similarity search
   */
  public searchVector(queryVector: number[], limit = 10): Array<{ chunk: AstChunk; score: number }> {
    const results: Array<{ chunk: AstChunk; score: number }> = [];

    for (const [id, vec] of this.vectors.entries()) {
      const chunk = this.chunks.get(id);
      if (!chunk) continue;
      const score = this.cosineSimilarity(queryVector, vec);
      results.push({ chunk, score });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  public tokenize(text: string): string[] {
    return text.toLowerCase().split(/[^a-zA-Z0-9_$]+/).filter((t) => t.length > 1);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom > 0 ? dot / denom : 0;
  }

  private recomputeAvgDocLength(): void {
    if (this.docLengths.size === 0) {
      this.avgDocLength = 0;
      return;
    }
    let total = 0;
    for (const len of this.docLengths.values()) {
      total += len;
    }
    this.avgDocLength = total / this.docLengths.size;
  }
}
