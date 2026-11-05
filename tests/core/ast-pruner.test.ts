import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterParser } from '../../src/core/ast/tree-sitter-parser.js';
import { DependencyGraphBuilder } from '../../src/core/ast/graph-builder.js';
import { AstPruner } from '../../src/core/ast/pruner.js';

describe('AST-Native Graph Workspace & Symbol Slicing (Prompt 4)', () => {
  let parser: TreeSitterParser;
  let graphBuilder: DependencyGraphBuilder;
  let pruner: AstPruner;

  beforeEach(() => {
    parser = new TreeSitterParser({ enableCache: true });
    graphBuilder = new DependencyGraphBuilder(parser);
    pruner = new AstPruner(parser);
  });

  describe('TreeSitterParser Multi-Language Parsing', () => {
    it('should parse TypeScript interfaces, types, classes, and functions', () => {
      const tsCode = `
import { DatabaseClient } from './db.js';
import { Telemetry } from './telemetry.js';

export interface UserSession {
  id: string;
  userId: string;
  roles: string[];
  expiresAt: number;
}

export type SessionToken = string;

export class AuthService {
  private db: DatabaseClient;

  constructor(db: DatabaseClient) {
    this.db = db;
  }

  public async validateSession(token: SessionToken): Promise<UserSession | null> {
    const raw = await this.db.find(token);
    Telemetry.track('session_validated');
    return raw;
  }
}

export function generateToken(seed: string): SessionToken {
  return 'token_' + seed;
}
`;
      const parsed = parser.parse('src/auth/service.ts', tsCode);

      expect(parsed.language).toBe('typescript');
      expect(parsed.symbols.length).toBeGreaterThanOrEqual(4);

      const symbolNames = parsed.symbols.map((s) => s.name);
      expect(symbolNames).toContain('UserSession');
      expect(symbolNames).toContain('SessionToken');
      expect(symbolNames).toContain('AuthService');
      expect(symbolNames).toContain('AuthService.validateSession');
      expect(symbolNames).toContain('generateToken');

      const userSession = parsed.symbols.find((s) => s.name === 'UserSession')!;
      expect(userSession.kind).toBe('interface');
      expect(userSession.isExported).toBe(true);

      const importRefs = parsed.references.filter((r) => r.kind === 'import');
      expect(importRefs.map((r) => r.targetSymbol)).toContain('DatabaseClient');
      expect(importRefs.map((r) => r.targetSymbol)).toContain('Telemetry');
    });

    it('should parse Python classes, methods, and functions', () => {
      const pyCode = `
import os
from typing import List, Optional

class VectorIndex:
    """In-memory vector similarity index."""
    dimension: int

    def __init__(self, dim: int):
        self.dimension = dim
        self.vectors = []

    def insert(self, vec: List[float]) -> bool:
        self.vectors.append(vec)
        return True

def compute_cosine(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    return dot
`;
      const parsed = parser.parse('ml/vector.py', pyCode);
      expect(parsed.language).toBe('python');

      const symbolNames = parsed.symbols.map((s) => s.name);
      expect(symbolNames).toContain('VectorIndex');
      expect(symbolNames).toContain('VectorIndex.insert');
      expect(symbolNames).toContain('compute_cosine');

      const classSym = parsed.symbols.find((s) => s.name === 'VectorIndex')!;
      expect(classSym.kind).toBe('class');
    });

    it('should parse Go structs, interfaces, and functions', () => {
      const goCode = `
package worker

import (
  "context"
  "fmt"
)

type JobQueue interface {
  Push(job string) error
  Pop() (string, error)
}

type MemoryQueue struct {
  items []string
}

func (q *MemoryQueue) Push(job string) error {
  q.items = append(q.items, job)
  return nil
}

func ProcessJobs(ctx context.Context, q JobQueue) int {
  fmt.Println("processing")
  return 42
}
`;
      const parsed = parser.parse('pkg/worker/queue.go', goCode);
      expect(parsed.language).toBe('go');

      const symbolNames = parsed.symbols.map((s) => s.name);
      expect(symbolNames).toContain('JobQueue');
      expect(symbolNames).toContain('MemoryQueue');
      expect(symbolNames).toContain('MemoryQueue.Push');
      expect(symbolNames).toContain('ProcessJobs');

      const iface = parsed.symbols.find((s) => s.name === 'JobQueue')!;
      expect(iface.kind).toBe('interface');
    });

    it('should parse Rust structs, traits, and functions', () => {
      const rsCode = `
use std::collections::HashMap;

pub struct CacheStore {
    entries: HashMap<String, Vec<u8>>,
}

pub trait StorageEngine {
    fn read(&self, key: &str) -> Option<Vec<u8>>;
    fn write(&mut self, key: &str, data: Vec<u8>);
}

pub fn create_engine() -> CacheStore {
    CacheStore {
        entries: HashMap::new(),
    }
}
`;
      const parsed = parser.parse('crates/engine/src/lib.rs', rsCode);
      expect(parsed.language).toBe('rust');

      const symbolNames = parsed.symbols.map((s) => s.name);
      expect(symbolNames).toContain('CacheStore');
      expect(symbolNames).toContain('StorageEngine');
      expect(symbolNames).toContain('create_engine');

      const traitSym = parsed.symbols.find((s) => s.name === 'StorageEngine')!;
      expect(traitSym.kind).toBe('interface');
      expect(traitSym.isExported).toBe(true);
    });

    it('should gracefully fallback to text chunking for unknown languages', () => {
      const sqlCode = `
-- Migration 001
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL
);

-- Migration 002
CREATE INDEX idx_users_email ON users(email);
`;
      const parsed = parser.parse('migrations/001_init.sql', sqlCode);
      expect(parsed.language).toBe('unknown');
      expect(parsed.rootNode.children.length).toBeGreaterThanOrEqual(1);
      expect(parsed.rootNode.children[0].type).toBe('text_chunk');
    });

    it('should use cache for identical file content', () => {
      const code = 'export function fastCall(): number { return 100; }';
      const first = parser.parse('test/fast.ts', code);
      const second = parser.parse('test/fast.ts', code);

      expect(second.symbols.length).toBe(first.symbols.length);
      expect(second.loc).toBe(first.loc);
    });
  });

  describe('DependencyGraphBuilder (Nodes & Edges)', () => {
    it('should build directed graph connecting call and type-reference edges', () => {
      const modelsCode = `
export interface PaymentIntent {
  id: string;
  amount: number;
}

export function authorizePayment(intent: PaymentIntent): boolean {
  return intent.amount > 0;
}
`;
      const serviceCode = `
import { PaymentIntent, authorizePayment } from './models.js';

export class CheckoutService {
  public execute(intent: PaymentIntent): boolean {
    const ok = authorizePayment(intent);
    return ok;
  }
}
`;
      graphBuilder.addFile('src/models.ts', modelsCode);
      graphBuilder.addFile('src/service.ts', serviceCode);

      const summary = graphBuilder.getGraphSummary();
      expect(summary.fileCount).toBe(2);
      expect(summary.totalNodes).toBeGreaterThanOrEqual(3);

      const checkoutNode = graphBuilder.getNode('src/service.ts#CheckoutService');
      expect(checkoutNode).toBeDefined();

      const authorizeNode = graphBuilder.getNode('src/models.ts#authorizePayment');
      expect(authorizeNode).toBeDefined();

      // Transitive dependencies from CheckoutService
      const deps = graphBuilder.getTransitiveDependencies('src/service.ts#CheckoutService');
      const depNames = deps.map((d) => d.name);
      expect(depNames.some((n) => n === 'PaymentIntent' || n === 'authorizePayment')).toBe(true);
    });
  });

  describe('AstPruner (Token Optimization Engine)', () => {
    it('should prune TypeScript implementation bodies while preserving all type signatures', () => {
      const bulkySource = `
import { EngineConfig } from './config.js';
import { Logger } from './logger.js';

export interface CompilerResult {
  code: string;
  sourceMap: string;
  warnings: string[];
}

export interface OptimizationMetrics {
  durationMs: number;
  tokensProcessed: number;
}

export class HeavyOptimizer {
  private config: EngineConfig;
  private logger: Logger;

  constructor(config: EngineConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    for (let i = 0; i < 50; i++) {
      this.logger.debug("Initializing pass " + i);
    }
  }

  public optimize(rawAst: string): CompilerResult {
    let intermediate = rawAst;
    for (let step = 0; step < 100; step++) {
      intermediate = intermediate.replace(/\\s+/g, ' ');
      intermediate = intermediate.toLowerCase();
      if (step % 10 === 0) {
        this.logger.debug("Step " + step + " completed");
      }
    }
    const result: CompilerResult = {
      code: intermediate,
      sourceMap: 'v3/sourcemap/mock',
      warnings: ['deprecated syntax', 'unused variable'],
    };
    return result;
  }

  public computeMetrics(start: number, end: number): OptimizationMetrics {
    const delta = end - start;
    const tokens = delta * 14.5;
    return {
      durationMs: delta,
      tokensProcessed: tokens,
    };
  }
}

export function standaloneHelper(data: string, factor: number): string {
  let acc = data;
  for (let k = 0; k < 200; k++) {
    acc += "_" + factor * k;
  }
  return acc.trim();
}
`;

      const result = pruner.pruneSource('src/heavy-optimizer.ts', bulkySource);

      // Verify interfaces and type signatures preserved
      expect(result.prunedCode).toContain('export interface CompilerResult');
      expect(result.prunedCode).toContain('export interface OptimizationMetrics');
      expect(result.prunedCode).toContain('export class HeavyOptimizer');
      expect(result.prunedCode).toContain('public optimize(rawAst: string): CompilerResult');
      expect(result.prunedCode).toContain('public computeMetrics(start: number, end: number): OptimizationMetrics');
      expect(result.prunedCode).toContain('export function standaloneHelper(data: string, factor: number): string');

      // Verify heavy internal loop logic is omitted
      expect(result.prunedCode).not.toContain('for (let step = 0; step < 100; step++)');
      expect(result.prunedCode).not.toContain('for (let k = 0; k < 200; k++)');
      expect(result.prunedCode).toContain('/* implementation omitted */');

      // Verify token reduction >= 50%
      expect(result.reductionRatioPercent).toBeGreaterThanOrEqual(50);
      expect(result.prunedTokens).toBeLessThan(result.originalTokens * 0.5);
    });

    it('should prune Python implementation bodies while preserving signatures', () => {
      const pythonHeavy = `
from typing import Dict, Any, List

class NeuralTokenizer:
    vocab: Dict[str, int]
    max_len: int

    def __init__(self, vocab_path: str, max_len: int = 512):
        self.vocab = {}
        self.max_len = max_len
        with open(vocab_path, "r") as f:
            for idx, line in enumerate(f):
                token = line.strip()
                self.vocab[token] = idx
                for sub in range(10):
                    self.vocab[f"{token}_{sub}"] = idx + sub

    def encode(self, text: str) -> List[int]:
        tokens = []
        for word in text.split():
            tid = self.vocab.get(word, 0)
            tokens.append(tid)
            for j in range(20):
                tokens.append(tid ^ j)
        return tokens[:self.max_len]

    def decode(self, ids: List[int]) -> str:
        words = []
        inv = {v: k for k, v in self.vocab.items()}
        for token_id in ids:
            words.append(inv.get(token_id, "<unk>"))
        return " ".join(words)

def build_bpe_corpus(raw_texts: List[str]) -> Dict[str, int]:
    freqs = {}
    for text in raw_texts:
        for char in text:
            freqs[char] = freqs.get(char, 0) + 1
            for k in range(50):
                freqs[f"{char}_{k}"] = freqs.get(char, 0) + k
    return freqs
`;
      const result = pruner.pruneSource('ml/tokenizer.py', pythonHeavy);

      // Verify class and method signatures preserved
      expect(result.prunedCode).toContain('class NeuralTokenizer:');
      expect(result.prunedCode).toContain('def encode(self, text: str) -> List[int]:');
      expect(result.prunedCode).toContain('def decode(self, ids: List[int]) -> str:');
      expect(result.prunedCode).toContain('def build_bpe_corpus(raw_texts: List[str]) -> Dict[str, int]:');

      // Verify bodies replaced with ellipsis/omitted comment
      expect(result.prunedCode).not.toContain('for word in text.split():');
      expect(result.prunedCode).not.toContain('for k in range(50):');

      // Verify token reduction >= 50%
      expect(result.reductionRatioPercent).toBeGreaterThanOrEqual(50);
    });

    it('should prune Go implementation bodies while preserving structs and interfaces', () => {
      const goHeavy = `
package compiler

type ASTNode struct {
  Type string
  Value string
}

type Compiler interface {
  Compile(source string) ([]ASTNode, error)
  Optimize(nodes []ASTNode) []ASTNode
}

type BytecodeGenerator struct {
  Instructions []byte
  SymbolTable map[string]int
}

func (bg *BytecodeGenerator) Compile(source string) ([]ASTNode, error) {
  var nodes []ASTNode
  for i := 0; i < 500; i++ {
    nodes = append(nodes, ASTNode{Type: "TOKEN", Value: source})
    if i % 10 == 0 {
      bg.Instructions = append(bg.Instructions, byte(i & 0xFF))
    }
  }
  return nodes, nil
}

func (bg *BytecodeGenerator) Optimize(nodes []ASTNode) []ASTNode {
  optimized := make([]ASTNode, 0, len(nodes))
  for idx, node := range nodes {
    if node.Type != "COMMENT" {
      optimized = append(optimized, node)
      bg.SymbolTable[node.Value] = idx
    }
  }
  return optimized
}

func (bg *BytecodeGenerator) EmitBytes() []byte {
  buf := make([]byte, 1024)
  for k, v := range bg.SymbolTable {
    for b := 0; b < len(k); b++ {
      buf = append(buf, k[b] ^ byte(v))
    }
  }
  return buf
}
`;
      const result = pruner.pruneSource('pkg/compiler/gen.go', goHeavy);

      expect(result.prunedCode).toContain('type ASTNode struct');
      expect(result.prunedCode).toContain('type Compiler interface');
      expect(result.prunedCode).toContain('func (bg *BytecodeGenerator) Compile(source string) ([]ASTNode, error)');
      expect(result.prunedCode).toContain('func (bg *BytecodeGenerator) Optimize(nodes []ASTNode) []ASTNode');
      expect(result.prunedCode).not.toContain('for i := 0; i < 500; i++');
      expect(result.reductionRatioPercent).toBeGreaterThanOrEqual(50);
    });

    it('should prune workspace dependency files using DependencyGraph', () => {
      const clientCode = `
import { DatabaseService } from './db.js';

export function runClient(): void {
  const db = new DatabaseService();
  db.query();
}
`;
      const dbCode = `
export class DatabaseService {
  public query(): string[] {
    const list: string[] = [];
    for (let i = 0; i < 150; i++) {
      list.push("row_" + i);
    }
    return list;
  }
}
`;
      graphBuilder.addFile('src/client.ts', clientCode);
      graphBuilder.addFile('src/db.ts', dbCode);

      const contents = new Map<string, string>([
        ['src/client.ts', clientCode],
        ['src/db.ts', dbCode],
      ]);

      const dependencyResults = pruner.pruneDependencies('src/client.ts', graphBuilder, contents);

      expect(dependencyResults.has('src/db.ts')).toBe(true);
      const dbPruned = dependencyResults.get('src/db.ts')!;
      expect(dbPruned.prunedCode).toContain('export class DatabaseService');
      expect(dbPruned.prunedCode).toContain('/* implementation omitted */');
      expect(dbPruned.reductionRatioPercent).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Parse Performance Benchmark (< 50ms per 1,000 LOC)', () => {
    it('should parse 1,000+ LOC in under 50ms', () => {
      // Synthesize 1,000 LOC file with realistic AST elements
      const lines: string[] = [
        '// Autogenerated Benchmark Codebase',
        "import { BaseLogger } from './logger.js';",
      ];

      for (let i = 0; i < 100; i++) {
        lines.push(`export interface Entity${i} {`);
        lines.push(`  id: string;`);
        lines.push(`  score: number;`);
        lines.push(`  timestamp: number;`);
        lines.push(`}`);
        lines.push('');
        lines.push(`export class Manager${i} {`);
        lines.push(`  public getEntity(id: string): Entity${i} {`);
        lines.push(`    return { id, score: ${i}, timestamp: Date.now() };`);
        lines.push(`  }`);
        lines.push(`}`);
        lines.push('');
      }

      const benchmarkSource = lines.join('\n');
      const totalLoc = lines.length;
      expect(totalLoc).toBeGreaterThanOrEqual(1000);

      // Warmup and run
      parser.clearCache();
      const parsed = parser.parse('benchmark/large_module.ts', benchmarkSource);

      expect(parsed.loc).toBe(totalLoc);
      expect(parsed.parseDurationMs).toBeLessThan(50);
      expect(parsed.symbols.length).toBeGreaterThanOrEqual(200);
    });
  });
});
