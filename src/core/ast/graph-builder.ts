import type {
  AstReference,
  AstSymbol,
  DependencyGraph,
  DependencyGraphNode,
  ParsedSourceFile,
  SupportedLanguage,
} from './types.js';
import { TreeSitterParser } from './tree-sitter-parser.js';

export class DependencyGraphBuilder {
  private parser: TreeSitterParser;
  private graph: DependencyGraph;
  private parsedFiles = new Map<string, ParsedSourceFile>();

  constructor(parser?: TreeSitterParser) {
    this.parser = parser || new TreeSitterParser();
    this.graph = {
      nodes: new Map<string, DependencyGraphNode>(),
      files: new Map<string, string[]>(),
    };
  }

  public addFile(
    filePath: string,
    content: string,
    language?: SupportedLanguage
  ): ParsedSourceFile {
    const parsed = this.parser.parse(filePath, content, language);
    this.addParsedFile(parsed);
    return parsed;
  }

  public addParsedFile(parsed: ParsedSourceFile): void {
    this.parsedFiles.set(parsed.filePath, parsed);
    const fileSymbolIds: string[] = [];

    // Register all nodes in this file
    if (parsed.symbols.length === 0) {
      const fileNodeId = `${parsed.filePath}#<file>`;
      const existing = this.graph.nodes.get(fileNodeId);
      this.graph.nodes.set(fileNodeId, {
        id: fileNodeId,
        name: '<file>',
        kind: 'variable',
        filePath: parsed.filePath,
        signature: `file: ${parsed.filePath}`,
        isExported: false,
        outgoingEdges: existing ? existing.outgoingEdges : [],
        incomingEdges: existing ? existing.incomingEdges : [],
      });
      fileSymbolIds.push(fileNodeId);
    } else {
      for (const sym of parsed.symbols) {
        const nodeId = `${parsed.filePath}#${sym.name}`;
        const existing = this.graph.nodes.get(nodeId);

        const node: DependencyGraphNode = {
          id: nodeId,
          name: sym.name,
          kind: sym.kind,
          filePath: parsed.filePath,
          signature: sym.signature,
          isExported: sym.isExported,
          outgoingEdges: existing ? existing.outgoingEdges : [],
          incomingEdges: existing ? existing.incomingEdges : [],
        };

        this.graph.nodes.set(nodeId, node);
        fileSymbolIds.push(nodeId);
      }
    }

    this.graph.files.set(parsed.filePath, fileSymbolIds);

    // Rebuild edges across all parsed files
    this.rebuildEdges();
  }

  public getNode(id: string): DependencyGraphNode | undefined {
    return this.graph.nodes.get(id);
  }

  public getNodeBySymbol(name: string): DependencyGraphNode | undefined {
    for (const node of this.graph.nodes.values()) {
      if (node.name === name) return node;
    }
    return undefined;
  }

  public getGraph(): DependencyGraph {
    return this.graph;
  }

  public getSymbolDependencies(nodeId: string): string[] {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return [];
    return [...node.outgoingEdges];
  }

  public getDependents(nodeId: string): string[] {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return [];
    return [...node.incomingEdges];
  }

  public getTransitiveDependencies(nodeId: string, maxDepth = 10): DependencyGraphNode[] {
    const visited = new Set<string>();
    const result: DependencyGraphNode[] = [];

    const traverse = (currentId: string, depth: number) => {
      if (depth > maxDepth || visited.has(currentId)) return;
      visited.add(currentId);

      const node = this.graph.nodes.get(currentId);
      if (!node) return;

      if (currentId !== nodeId) {
        result.push(node);
      }

      for (const targetId of node.outgoingEdges) {
        traverse(targetId, depth + 1);
      }
    };

    traverse(nodeId, 0);
    return result;
  }

  public getGraphSummary(): { totalNodes: number; totalEdges: number; fileCount: number } {
    let totalEdges = 0;
    for (const node of this.graph.nodes.values()) {
      totalEdges += node.outgoingEdges.length;
    }
    return {
      totalNodes: this.graph.nodes.size,
      totalEdges,
      fileCount: this.graph.files.size,
    };
  }

  /* -------------------------------------------------------------
   * Edge Resolution
   * ------------------------------------------------------------- */
  private rebuildEdges(): void {
    // Clear existing edges
    for (const node of this.graph.nodes.values()) {
      node.outgoingEdges = [];
      node.incomingEdges = [];
    }

    // Symbol registry by name for resolution
    const symbolMap = new Map<string, string[]>(); // name -> [nodeIds]
    for (const [id, node] of this.graph.nodes.entries()) {
      const list = symbolMap.get(node.name) || [];
      list.push(id);
      symbolMap.set(node.name, list);
    }

    // Process references for each file
    for (const [filePath, parsed] of this.parsedFiles.entries()) {
      for (const ref of parsed.references) {
        // Determine source node ID
        let sourceNodeId: string | undefined;

        if (ref.sourceSymbol && ref.sourceSymbol !== '<module>' && ref.sourceSymbol !== '<package>' && ref.sourceSymbol !== '<crate>') {
          sourceNodeId = `${filePath}#${ref.sourceSymbol}`;
        } else {
          // Find symbol enclosing ref.line
          for (const sym of parsed.symbols) {
            if (ref.line >= sym.startLine && ref.line <= sym.endLine) {
              sourceNodeId = `${filePath}#${sym.name}`;
              break;
            }
          }
          if (!sourceNodeId && this.graph.nodes.has(`${filePath}#<file>`)) {
            sourceNodeId = `${filePath}#<file>`;
          }
        }

        // Target candidates
        const targetCandidateIds = symbolMap.get(ref.targetSymbol) || [];
        for (const targetId of targetCandidateIds) {
          // If source exists, connect source -> target
          if (sourceNodeId && this.graph.nodes.has(sourceNodeId) && sourceNodeId !== targetId) {
            const sourceNode = this.graph.nodes.get(sourceNodeId)!;
            const targetNode = this.graph.nodes.get(targetId)!;

            if (!sourceNode.outgoingEdges.includes(targetId)) {
              sourceNode.outgoingEdges.push(targetId);
            }
            if (!targetNode.incomingEdges.includes(sourceNodeId)) {
              targetNode.incomingEdges.push(sourceNodeId);
            }
          }
        }
      }
    }
  }
}
