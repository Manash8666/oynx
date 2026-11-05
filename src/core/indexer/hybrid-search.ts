import { SqliteVectorStore } from './sqlite-store.js';
import type { AstChunk, SearchQuery, SearchResult } from './types.js';

export class HybridSearchEngine {
  private store: SqliteVectorStore;

  constructor(store?: SqliteVectorStore) {
    this.store = store || new SqliteVectorStore();
  }

  public getStore(): SqliteVectorStore {
    return this.store;
  }

  /**
   * Generates lightweight deterministic semantic embedding vector (384 dimensions)
   */
  public generateEmbedding(text: string): number[] {
    const dim = 384;
    const vec = new Array(dim).fill(0);
    const tokens = this.store.tokenize(text);

    for (const token of tokens) {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dim;
      vec[idx] += 1.0;
    }

    // Normalize unit vector
    const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    return mag > 0 ? vec.map((v) => v / mag) : vec;
  }

  public search(query: SearchQuery): SearchResult[] {
    const limit = query.limit || 10;
    const bm25Hits = this.store.searchBM25(query.query, limit * 2);

    const qVec = query.vector || this.generateEmbedding(query.query);
    const vectorHits = this.store.searchVector(qVec, limit * 2);

    // Map ranks
    const bm25RankMap = new Map<string, number>();
    bm25Hits.forEach((hit, idx) => bm25RankMap.set(hit.chunk.id, idx + 1));

    const vectorRankMap = new Map<string, number>();
    vectorHits.forEach((hit, idx) => vectorRankMap.set(hit.chunk.id, idx + 1));

    // Combine all unique candidate chunks
    const candidateChunks = new Map<string, AstChunk>();
    for (const hit of bm25Hits) candidateChunks.set(hit.chunk.id, hit.chunk);
    for (const hit of vectorHits) candidateChunks.set(hit.chunk.id, hit.chunk);

    const scoredResults: SearchResult[] = [];

    for (const [id, chunk] of candidateChunks.entries()) {
      // Apply filters if provided
      if (query.filter) {
        if (query.filter.onlyExported && !chunk.isExported) continue;
        if (query.filter.directory && !chunk.filePath.startsWith(query.filter.directory)) continue;
        if (query.filter.extensions && !query.filter.extensions.some((ext) => chunk.filePath.endsWith(ext))) {
          continue;
        }
      }

      const bm25Rank = bm25RankMap.get(id);
      const vectorRank = vectorRankMap.get(id);

      // Reciprocal Rank Fusion: 1 / (60 + Rank)
      const bm25Score = bm25Rank !== undefined ? 1.0 / (60 + bm25Rank) : 0;
      const vectorScore = vectorRank !== undefined ? 1.0 / (60 + vectorRank) : 0;
      const rrfScore = bm25Score + vectorScore;

      scoredResults.push({
        chunk,
        bm25Rank,
        vectorRank,
        rrfScore: Number(rrfScore.toFixed(5)),
      });
    }

    return scoredResults.sort((a, b) => b.rrfScore - a.rrfScore).slice(0, limit);
  }
}
