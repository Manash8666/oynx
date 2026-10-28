import { describe, expect, test } from "bun:test"
import { CodebaseKnowledgeGraph } from "../src/codebase-knowledge-graph"

describe("Graph-RAG: Semantic Codebase Knowledge Graph (Upgrade 8)", () => {
  const graph = new CodebaseKnowledgeGraph()

  // Construct a realistic mini dependency graph:
  // UserInterface (src/types.ts) <- UserService (src/services/user.ts) <- UserController (src/api/user.ts) <- UserView (src/ui/UserView.tsx)
  graph.addNode({ id: "sym-1", name: "UserInterface", kind: "INTERFACE", filePath: "src/types.ts", line: 10 })
  graph.addNode({ id: "sym-2", name: "UserService", kind: "CLASS", filePath: "src/services/user.ts", line: 15 })
  graph.addNode({ id: "sym-3", name: "UserController", kind: "CLASS", filePath: "src/api/user.ts", line: 20 })
  graph.addNode({ id: "sym-4", name: "UserView", kind: "FUNCTION", filePath: "src/ui/UserView.tsx", line: 5 })

  graph.addEdge({ sourceId: "sym-2", targetId: "sym-1", type: "IMPLEMENTS" })
  graph.addEdge({ sourceId: "sym-3", targetId: "sym-2", type: "CALLS" })
  graph.addEdge({ sourceId: "sym-4", targetId: "sym-3", type: "CALLS" })

  test("should track nodes and verify graph connectivity", () => {
    expect(graph.getNodeCount()).toBe(4)
  })

  test("should compute multi-hop topological ripple impact when an interface changes", () => {
    const impact = graph.analyzeImpact("UserInterface", 5)

    expect(impact.rootSymbol).toBe("UserInterface")
    expect(impact.totalAffectedSymbols).toBe(3)
    expect(impact.affectedFiles).toContain("src/services/user.ts")
    expect(impact.affectedFiles).toContain("src/api/user.ts")
    expect(impact.affectedFiles).toContain("src/ui/UserView.tsx")

    // Verify propagation chain distance
    expect(impact.propagationChain[0].symbol).toBe("UserService")
    expect(impact.propagationChain[0].hopDistance).toBe(1)
    expect(impact.propagationChain[2].symbol).toBe("UserView")
    expect(impact.propagationChain[2].hopDistance).toBe(3)
  })

  test("should gracefully return empty impact for unknown symbol", () => {
    const impact = graph.analyzeImpact("NonExistentSymbol")
    expect(impact.totalAffectedSymbols).toBe(0)
    expect(impact.affectedFiles.length).toBe(0)
  })
})
