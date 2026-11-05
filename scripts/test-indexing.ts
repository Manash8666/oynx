import { HybridSearchEngine } from '../src/core/indexer/hybrid-search.js';
import { AstChunker } from '../src/core/indexer/ast-chunker.js';
import { CodebaseWatcher } from '../src/core/indexer/watcher.js';

async function verifyHybridIndexing() {
  console.log('--- Testing Local Hybrid Vector + BM25 Codebase Indexer ---');

  const searchEngine = new HybridSearchEngine();
  const chunker = new AstChunker();
  const watcher = new CodebaseWatcher(searchEngine, chunker);

  // Sample codebase modules
  const authModule = `
import { Database } from './db.js';

export interface AuthSession {
  userId: string;
  token: string;
}

export class AuthService {
  private db: Database;

  public async validateUserAuthentication(sessionToken: string): Promise<AuthSession | null> {
    // Validates authentication token against session store
    if (!sessionToken || sessionToken.length < 10) return null;
    return { userId: "usr_99", token: sessionToken };
  }
}
`;

  const billingModule = `
export function processMonthlyInvoice(companyId: string, amount: number): boolean {
  console.log("Charging invoice amount: " + amount);
  return true;
}
`;

  const telemetryModule = `
export function trackSystemMetric(metricName: string, value: number): void {
  console.log("Metric logged: " + metricName);
}
`;

  console.log('1. Ingesting files into indexer...');
  await watcher.onFileChanged('src/auth/service.ts', authModule);
  await watcher.onFileChanged('src/billing/invoice.ts', billingModule);
  await watcher.onFileChanged('src/telemetry/metrics.ts', telemetryModule);

  console.log('2. Executing semantic search query: "where is user authentication validated"...');
  const start = performance.now();
  const results = searchEngine.search({
    query: 'where is user authentication validated',
    limit: 3,
  });
  const duration = performance.now() - start;

  console.log(`✓ Query completed in ${duration.toFixed(2)}ms (Budget: <50ms)`);
  if (duration >= 50) {
    throw new Error(`Latency budget exceeded: ${duration}ms >= 50ms`);
  }

  if (results.length === 0) {
    throw new Error('No search results returned');
  }

  const topMatch = results[0];
  console.log(`✓ Top Match Symbol: ${topMatch.chunk.symbolName} in ${topMatch.chunk.filePath}`);
  console.log(`✓ RRF Score: ${topMatch.rrfScore}`);

  if (
    topMatch.chunk.symbolName !== 'AuthService.validateUserAuthentication' &&
    topMatch.chunk.symbolName !== 'AuthService'
  ) {
    throw new Error(`Expected top match to be authentication validator, got: ${topMatch.chunk.symbolName}`);
  }

  console.log('✓ Top match accurately located user authentication validation in top results.');
  console.log('All Indexer tests passed with exit code 0.');
}

verifyHybridIndexing().catch((err) => {
  console.error('Indexing verification failed:', err);
  process.exit(1);
});
