import { AstChunker } from './ast-chunker.js';
import { HybridSearchEngine } from './hybrid-search.js';

export class CodebaseWatcher {
  private chunker: AstChunker;
  private searchEngine: HybridSearchEngine;
  private ignoredPatterns = [
    /node_modules/,
    /\.git/,
    /\.onyx/,
    /\.env(?:\..*)?$/,
    /dist/,
    /build/,
  ];

  constructor(searchEngine: HybridSearchEngine, chunker?: AstChunker) {
    this.searchEngine = searchEngine;
    this.chunker = chunker || new AstChunker();
  }

  public isIgnored(filePath: string): boolean {
    return this.ignoredPatterns.some((pattern) => pattern.test(filePath));
  }

  public async onFileChanged(filePath: string, newContent: string): Promise<number> {
    const startTime = performance.now();
    if (this.isIgnored(filePath)) return 0;

    const store = this.searchEngine.getStore();

    // 1. Evict previous file chunks
    store.removeFileChunks(filePath);

    // 2. Re-chunk file along semantic AST boundaries
    const chunks = this.chunker.chunkFile(filePath, newContent);

    // 3. Re-index each chunk
    for (const chunk of chunks) {
      const vec = this.searchEngine.generateEmbedding(chunk.content + ' ' + chunk.symbolName);
      store.upsertChunk(chunk, vec);
    }

    return Number((performance.now() - startTime).toFixed(2));
  }
}
