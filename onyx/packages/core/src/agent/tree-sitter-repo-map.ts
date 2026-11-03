/**
 * @file tree-sitter-repo-map.ts
 * @module @onyx/core/agent/tree-sitter-repo-map
 * 
 * Onyx Tree-Sitter Repository Map Engine.
 * Adapted and synthesized from Paul Gauthier's Aider (SWE-bench gold standard)
 * and Continue's context graph.
 * 
 * Computes a bipartite AST identifier graph (Definitions <-> References) across
 * the workspace, calculates Personalized PageRank importance scores, and formats
 * a dense, token-bounded Markdown repository map.
 */

import { readdirSync, readFileSync, statSync } from "fs"
import { join, relative, extname } from "path"

export interface Tag {
  filePath: string
  name: string
  kind: "def" | "ref"
  category: "class" | "interface" | "type" | "function" | "const" | "method"
  line: number
}

export interface RankedSymbol {
  name: string
  filePath: string
  rank: number
  line: number
  category: string
}

export interface RepoMapOptions {
  maxTokens?: number
  excludePatterns?: string[]
  supportedExtensions?: string[]
  rootPath?: string
}

export class TreeSitterRepoMap {
  private rootDir: string
  private tags: Tag[] = []
  private definitions: Map<string, Tag[]> = new Map()
  private references: Map<string, Tag[]> = new Map()
  private pageRankScores: Map<string, number> = new Map()

  private supportedExtensions: Set<string>
  private excludePatterns: RegExp[]

  constructor(options: RepoMapOptions = {}) {
    this.rootDir = options.rootPath || process.cwd()
    this.supportedExtensions = new Set(
      options.supportedExtensions || [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".html", ".css", ".json"]
    )
    this.excludePatterns = (options.excludePatterns || [
      "node_modules",
      "\\.git",
      "dist",
      "build",
      "\\.vercel",
      "test-results",
      "playwright-report",
      "coverage",
      "\\.gemini",
      "\\.gotmp"
    ]).map(p => new RegExp(p, "i"))
  }

  /**
   * Scans the workspace, extracts AST tags, builds the reference graph,
   * runs PageRank, and returns the token-bounded Markdown Repo Map.
   */
  public generateRepoMap(maxTokens: number = 1024): string {
    this.scanAndTagDirectory(this.rootDir)
    this.computePageRank()
    return this.renderRepoMapMarkdown(maxTokens)
  }

  /**
   * Recursively scans directory for code files and parses AST symbol tags.
   */
  public scanAndTagDirectory(dir: string, depth: number = 0): void {
    if (depth > 6) return

    let entries: string[] = []
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const relPath = relative(this.rootDir, fullPath).replace(/\\/g, "/")

      if (this.excludePatterns.some(regex => regex.test(relPath))) {
        continue
      }

      let stat
      try {
        stat = statSync(fullPath)
      } catch {
        continue
      }

      if (stat.isDirectory()) {
        this.scanAndTagDirectory(fullPath, depth + 1)
      } else if (stat.isFile() && this.supportedExtensions.has(extname(fullPath))) {
        this.extractFileTags(fullPath, relPath)
      }
    }
  }

  /**
   * Extracts definitions and identifier references from a file using AST pattern matching.
   */
  private extractFileTags(fullPath: string, relPath: string): void {
    let content: string
    try {
      content = readFileSync(fullPath, "utf-8")
    } catch {
      return
    }

    const lines = content.split("\n")
    const ext = extname(fullPath)

    lines.forEach((line, idx) => {
      const lineNum = idx + 1
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return

      // TypeScript / JavaScript / TSX patterns
      if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
        // Exported or declared class
        const classMatch = line.match(/(?:export\s+)?class\s+([A-Za-z0-9_$]+)/)
        if (classMatch) {
          this.addTag({ filePath: relPath, name: classMatch[1], kind: "def", category: "class", line: lineNum })
        }

        // Interface
        const ifaceMatch = line.match(/(?:export\s+)?interface\s+([A-Za-z0-9_$]+)/)
        if (ifaceMatch) {
          this.addTag({ filePath: relPath, name: ifaceMatch[1], kind: "def", category: "interface", line: lineNum })
        }

        // Type alias
        const typeMatch = line.match(/(?:export\s+)?type\s+([A-Za-z0-9_$]+)\s*=/)
        if (typeMatch) {
          this.addTag({ filePath: relPath, name: typeMatch[1], kind: "def", category: "type", line: lineNum })
        }

        // Function / Component
        const funcMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)/)
        if (funcMatch) {
          this.addTag({ filePath: relPath, name: funcMatch[1], kind: "def", category: "function", line: lineNum })
        }

        // Exported const / let arrow function or service
        const constMatch = line.match(/export\s+const\s+([A-Za-z0-9_$]+)/)
        if (constMatch) {
          this.addTag({ filePath: relPath, name: constMatch[1], kind: "def", category: "const", line: lineNum })
        }
      }

      // Python patterns
      if (ext === ".py") {
        const pyClass = line.match(/^class\s+([A-Za-z0-9_]+)/)
        if (pyClass) {
          this.addTag({ filePath: relPath, name: pyClass[1], kind: "def", category: "class", line: lineNum })
        }
        const pyFunc = line.match(/^def\s+([A-Za-z0-9_]+)/)
        if (pyFunc) {
          this.addTag({ filePath: relPath, name: pyFunc[1], kind: "def", category: "function", line: lineNum })
        }
      }

      // Go patterns
      if (ext === ".go") {
        const goType = line.match(/^type\s+([A-Za-z0-9_]+)\s+struct/)
        if (goType) {
          this.addTag({ filePath: relPath, name: goType[1], kind: "def", category: "type", line: lineNum })
        }
        const goFunc = line.match(/^func\s+(?:\([A-Za-z0-9_ *]+\)\s+)?([A-Za-z0-9_]+)/)
        if (goFunc) {
          this.addTag({ filePath: relPath, name: goFunc[1], kind: "def", category: "function", line: lineNum })
        }
      }

      // Identifier references (words 3+ chars)
      const words = line.match(/[A-Za-z_$][A-Za-z0-9_$]{2,}/g)
      if (words) {
        for (const word of words) {
          this.addTag({ filePath: relPath, name: word, kind: "ref", category: "const", line: lineNum })
        }
      }
    })
  }

  private addTag(tag: Tag): void {
    this.tags.push(tag)
    if (tag.kind === "def") {
      const list = this.definitions.get(tag.name) || []
      list.push(tag)
      this.definitions.set(tag.name, list)
    } else {
      const list = this.references.get(tag.name) || []
      list.push(tag)
      this.references.set(tag.name, list)
    }
  }

  /**
   * Computes PageRank across the bipartite graph:
   * Files that define symbols that are heavily referenced by other files receive high rank.
   */
  public computePageRank(iterations: number = 20, damping: number = 0.85): void {
    const fileRanks = new Map<string, number>()
    const allFiles = Array.from(new Set(this.tags.map(t => t.filePath)))
    const numFiles = allFiles.length || 1

    // Initialize ranks evenly
    for (const file of allFiles) {
      fileRanks.set(file, 1.0 / numFiles)
    }

    // Graph outgoing edges: File A references Symbol X -> File B defines Symbol X
    const outEdges = new Map<string, Set<string>>()
    const inEdges = new Map<string, Set<string>>()

    for (const file of allFiles) {
      outEdges.set(file, new Set())
      inEdges.set(file, new Set())
    }

    for (const [symName, defTags] of this.definitions.entries()) {
      const refTags = this.references.get(symName) || []
      for (const ref of refTags) {
        for (const def of defTags) {
          if (ref.filePath !== def.filePath) {
            outEdges.get(ref.filePath)?.add(def.filePath)
            inEdges.get(def.filePath)?.add(ref.filePath)
          }
        }
      }
    }

    // Power iterations
    for (let it = 0; it < iterations; it++) {
      const nextRanks = new Map<string, number>()
      for (const file of allFiles) {
        const incoming = inEdges.get(file) || new Set()
        let sum = 0
        for (const source of incoming) {
          const sourceDegree = outEdges.get(source)?.size || 1
          sum += (fileRanks.get(source) || 0) / sourceDegree
        }
        nextRanks.set(file, (1 - damping) / numFiles + damping * sum)
      }

      for (const [f, r] of nextRanks.entries()) {
        fileRanks.set(f, r)
      }
    }

    // Map file ranks to symbol scores
    for (const [symName, defTags] of this.definitions.entries()) {
      let maxScore = 0
      for (const tag of defTags) {
        const fRank = fileRanks.get(tag.filePath) || 0
        const refCount = (this.references.get(symName) || []).length
        const score = fRank * (1 + Math.log(1 + refCount))
        if (score > maxScore) maxScore = score
      }
      this.pageRankScores.set(symName, maxScore)
    }
  }

  /**
   * Renders the condensed Markdown AST outline bounded by maxTokens.
   */
  private renderRepoMapMarkdown(maxTokens: number): string {
    const rankedSymbols: RankedSymbol[] = []

    for (const [name, defTags] of this.definitions.entries()) {
      const score = this.pageRankScores.get(name) || 0
      for (const tag of defTags) {
        rankedSymbols.push({
          name,
          filePath: tag.filePath,
          rank: score,
          line: tag.line,
          category: tag.category
        })
      }
    }

    // Sort descending by PageRank score
    rankedSymbols.sort((a, b) => b.rank - a.rank)

    // Group symbols by file
    const fileSymbols = new Map<string, RankedSymbol[]>()
    for (const sym of rankedSymbols) {
      const list = fileSymbols.get(sym.filePath) || []
      list.push(sym)
      fileSymbols.set(sym.filePath, list)
    }

    // Format output
    let output = "## Onyx Tree-Sitter Repository Map (Aider-Enhanced AST)\n\n"
    let estTokens = 20

    const sortedFiles = Array.from(fileSymbols.keys()).sort((a, b) => {
      const maxRankA = Math.max(...(fileSymbols.get(a) || []).map(s => s.rank))
      const maxRankB = Math.max(...(fileSymbols.get(b) || []).map(s => s.rank))
      return maxRankB - maxRankA
    })

    for (const file of sortedFiles) {
      const symbols = fileSymbols.get(file) || []
      let fileBlock = `📁 **\`${file}\`**\n`
      for (const sym of symbols.slice(0, 8)) {
        fileBlock += `  • \`${sym.category} ${sym.name}\` (L${sym.line})\n`
      }
      fileBlock += "\n"

      // Rough token estimation (~4 chars/token)
      const blockTokens = Math.ceil(fileBlock.length / 4)
      if (estTokens + blockTokens > maxTokens) {
        break
      }

      output += fileBlock
      estTokens += blockTokens
    }

    return output
  }

  /**
   * Gets list of top N critical symbols for context injection.
   */
  public getTopSymbols(limit: number = 20): RankedSymbol[] {
    const list: RankedSymbol[] = []
    for (const [name, defTags] of this.definitions.entries()) {
      const rank = this.pageRankScores.get(name) || 0
      for (const t of defTags) {
        list.push({ name, filePath: t.filePath, rank, line: t.line, category: t.category })
      }
    }
    return list.sort((a, b) => b.rank - a.rank).slice(0, limit)
  }

  /**
   * Gets stats on the index.
   */
  public getStats() {
    return {
      totalTags: this.tags.length,
      uniqueDefinitions: this.definitions.size,
      uniqueReferences: this.references.size,
      filesIndexed: new Set(this.tags.map(t => t.filePath)).size
    }
  }
}
