export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'unknown';

export type SymbolKind =
  | 'function'
  | 'method'
  | 'class'
  | 'interface'
  | 'type'
  | 'variable'
  | 'enum';

export interface AstSymbol {
  name: string;
  kind: SymbolKind;
  isExported: boolean;
  startLine: number;
  endLine: number;
  signature: string;
  body?: string;
  docstring?: string;
}

export interface AstReference {
  sourceSymbol: string;
  targetSymbol: string;
  kind: 'call' | 'import' | 'extends' | 'implements' | 'type-reference';
  filePath: string;
  line: number;
}

export interface DependencyGraphNode {
  id: string; // "filePath#symbolName"
  name: string;
  kind: SymbolKind;
  filePath: string;
  signature: string;
  isExported: boolean;
  outgoingEdges: string[]; // target node IDs
  incomingEdges: string[]; // caller node IDs
}

export interface DependencyGraph {
  nodes: Map<string, DependencyGraphNode>;
  files: Map<string, string[]>;
}

export interface CstNode {
  type: string;
  text: string;
  startLine: number;
  endLine: number;
  children: CstNode[];
}

export interface ParsedSourceFile {
  filePath: string;
  language: SupportedLanguage;
  loc: number;
  parseDurationMs: number;
  symbols: AstSymbol[];
  references: AstReference[];
  rootNode: CstNode;
}

export interface PrunerResult {
  filePath: string;
  originalCode: string;
  prunedCode: string;
  originalTokens: number;
  prunedTokens: number;
  reductionRatioPercent: number;
  preservedSymbols: string[];
}
