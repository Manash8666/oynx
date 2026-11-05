export interface AstChunk {
  id: string; // filePath#symbolName
  filePath: string;
  symbolName: string;
  kind: string;
  startLine: number;
  endLine: number;
  content: string;
  imports: string[];
  docstring?: string;
  isExported: boolean;
}

export interface SearchQuery {
  query: string;
  vector?: number[];
  filter?: {
    extensions?: string[];
    directory?: string;
    onlyExported?: boolean;
  };
  limit?: number;
}

export interface SearchResult {
  chunk: AstChunk;
  bm25Rank?: number;
  vectorRank?: number;
  rrfScore: number;
}
