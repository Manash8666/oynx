export type SymbolKind = "INTERFACE" | "CLASS" | "FUNCTION" | "TYPE_ALIAS"

export interface GraphNode {
  readonly id: string
  readonly name: string
  readonly kind: SymbolKind
  readonly filePath: string
  readonly line: number
}

export type EdgeType = "CALLS" | "IMPLEMENTS" | "IMPORTS" | "USES_TYPE"

export interface GraphEdge {
  readonly sourceId: string
  readonly targetId: string
  readonly type: EdgeType
}

export interface ImpactAnalysisResult {
  readonly rootSymbol: string
  readonly rootFile: string
  readonly totalAffectedSymbols: number
  readonly affectedFiles: readonly string[]
  readonly propagationChain: readonly {
    symbol: string
    file: string
    hopDistance: number
    edgeType: EdgeType
  }[]
}

export class CodebaseKnowledgeGraph {
  private nodes: Map<string, GraphNode> = new Map()
  private outgoingEdges: Map<string, GraphEdge[]> = new Map()
  private incomingEdges: Map<string, GraphEdge[]> = new Map()

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node)
    if (!this.outgoingEdges.has(node.id)) this.outgoingEdges.set(node.id, [])
    if (!this.incomingEdges.has(node.id)) this.incomingEdges.set(node.id, [])
  }

  public addEdge(edge: GraphEdge): void {
    if (!this.outgoingEdges.has(edge.sourceId)) this.outgoingEdges.set(edge.sourceId, [])
    if (!this.incomingEdges.has(edge.targetId)) this.incomingEdges.set(edge.targetId, [])

    this.outgoingEdges.get(edge.sourceId)!.push(edge)
    this.incomingEdges.get(edge.targetId)!.push(edge)
  }

  /**
   * Performs multi-hop topological impact analysis:
   * Finds all downstream nodes that depend on or call this symbol.
   */
  public analyzeImpact(symbolName: string, maxHops = 5): ImpactAnalysisResult {
    // Find node by name
    const rootNode = Array.from(this.nodes.values()).find((n) => n.name === symbolName)
    if (!rootNode) {
      return {
        rootSymbol: symbolName,
        rootFile: "unknown",
        totalAffectedSymbols: 0,
        affectedFiles: [],
        propagationChain: [],
      }
    }

    const visited = new Set<string>([rootNode.id])
    const queue: { nodeId: string; hop: number; edgeType: EdgeType }[] = []
    const affectedFiles = new Set<string>()
    const propagationChain: {
      symbol: string
      file: string
      hopDistance: number
      edgeType: EdgeType
    }[] = []

    // Queue initial incoming edges (who depends on me)
    for (const edge of this.incomingEdges.get(rootNode.id) ?? []) {
      queue.push({ nodeId: edge.sourceId, hop: 1, edgeType: edge.type })
    }

    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current.nodeId) || current.hop > maxHops) continue
      visited.add(current.nodeId)

      const node = this.nodes.get(current.nodeId)
      if (node) {
        affectedFiles.add(node.filePath)
        propagationChain.push({
          symbol: node.name,
          file: node.filePath,
          hopDistance: current.hop,
          edgeType: current.edgeType,
        })

        // Queue next hop
        for (const nextEdge of this.incomingEdges.get(node.id) ?? []) {
          if (!visited.has(nextEdge.sourceId)) {
            queue.push({
              nodeId: nextEdge.sourceId,
              hop: current.hop + 1,
              edgeType: nextEdge.type,
            })
          }
        }
      }
    }

    return {
      rootSymbol: rootNode.name,
      rootFile: rootNode.filePath,
      totalAffectedSymbols: propagationChain.length,
      affectedFiles: Array.from(affectedFiles),
      propagationChain,
    }
  }

  public getNodeCount(): number {
    return this.nodes.size
  }
}
