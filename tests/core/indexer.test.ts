import { describe, it, expect, beforeEach } from 'vitest';
import { HybridSearchEngine } from '../../src/core/indexer/hybrid-search.js';
import { AstChunker } from '../../src/core/indexer/ast-chunker.js';
import { CodebaseWatcher } from '../../src/core/indexer/watcher.js';

describe('Local Hybrid Vector + BM25 Codebase Indexer', () => {
  let searchEngine: HybridSearchEngine;
  let watcher: CodebaseWatcher;

  beforeEach(() => {
    searchEngine = new HybridSearchEngine();
    watcher = new CodebaseWatcher(searchEngine, new AstChunker());
  });

  it('should chunk along AST boundaries and index semantic functions', async () => {
    const authCode = `
export class AuthService {
  public validateUserAuthentication(token: string): boolean {
    return token === 'secret';
  }
}
`;
    const latency = await watcher.onFileChanged('src/auth.ts', authCode);
    expect(latency).toBeLessThan(100);

    const results = searchEngine.search({
      query: 'validate user authentication',
      limit: 3,
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].chunk.symbolName).toContain('AuthService');
    expect(results[0].rrfScore).toBeGreaterThan(0);
  });

  it('should filter search results by directory and file extensions', async () => {
    await watcher.onFileChanged('src/frontend/App.tsx', 'export function App() { return <div>Home</div>; }');
    await watcher.onFileChanged('src/backend/server.ts', 'export function startServer() { return 8080; }');

    const frontendResults = searchEngine.search({
      query: 'App',
      filter: { directory: 'src/frontend' },
    });

    expect(frontendResults.length).toBe(1);
    expect(frontendResults[0].chunk.filePath).toBe('src/frontend/App.tsx');
  });
});
