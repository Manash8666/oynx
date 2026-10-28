export interface MemoryEntry {
  readonly id: string
  readonly type: "DECISION" | "ANTI_PATTERN" | "PREFERENCE" | "CODE_RECIPE"
  readonly title: string
  readonly content: string
  readonly tags: readonly string[]
  readonly timestamp: string
  readonly confidence: number // 0.0 to 1.0
}

export class PersistentProjectMemory {
  private entries: Map<string, MemoryEntry> = new Map()

  constructor(initialEntries?: MemoryEntry[]) {
    if (initialEntries) {
      for (const entry of initialEntries) {
        this.entries.set(entry.id, entry)
      }
    }
  }

  public recordDecision(title: string, content: string, tags: string[] = []): MemoryEntry {
    const entry: MemoryEntry = {
      id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: "DECISION",
      title,
      content,
      tags: [...tags, "architecture"],
      timestamp: new Date().toISOString(),
      confidence: 1.0,
    }
    this.entries.set(entry.id, entry)
    return entry
  }

  public recordAntiPattern(failedAction: string, warning: string, tags: string[] = []): MemoryEntry {
    const entry: MemoryEntry = {
      id: `anti-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: "ANTI_PATTERN",
      title: `Avoid: ${failedAction}`,
      content: warning,
      tags: [...tags, "warning", "anti-pattern"],
      timestamp: new Date().toISOString(),
      confidence: 0.95,
    }
    this.entries.set(entry.id, entry)
    return entry
  }

  public recordRecipe(title: string, codeSnippet: string, tags: string[] = []): MemoryEntry {
    const entry: MemoryEntry = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: "CODE_RECIPE",
      title,
      content: codeSnippet,
      tags: [...tags, "recipe"],
      timestamp: new Date().toISOString(),
      confidence: 0.9,
    }
    this.entries.set(entry.id, entry)
    return entry
  }

  /**
   * Retrieves relevant memory entries matching query context to inject into agent prompt.
   */
  public queryRelevantContext(query: string, limit = 5): MemoryEntry[] {
    const lower = query.toLowerCase()
    const words = lower.split(/\W+/).filter((w) => w.length > 2)
    const scored: { entry: MemoryEntry; score: number } = []

    for (const entry of this.entries.values()) {
      let score = 0
      const titleLower = entry.title.toLowerCase()
      const contentLower = entry.content.toLowerCase()

      // Exact substring match gives high boost
      if (titleLower.includes(lower)) score += 5
      if (contentLower.includes(lower)) score += 3

      // Word-level token matching
      for (const word of words) {
        if (titleLower.includes(word)) score += 2
        if (contentLower.includes(word)) score += 1.5
        for (const tag of entry.tags) {
          if (tag.toLowerCase().includes(word)) score += 2
        }
      }

      if (score > 0) {
        scored.push({ entry, score: score * entry.confidence })
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.entry)
  }

  public formatSystemPromptConstraints(query: string): string {
    const relevant = this.queryRelevantContext(query, 3)
    if (relevant.length === 0) return ""

    const lines = ["## Persistent Project Memory & Learned Constraints:"]
    for (const item of relevant) {
      if (item.type === "ANTI_PATTERN") {
        lines.push(`- [CRITICAL WARNING] ${item.title}: ${item.content}`)
      } else if (item.type === "DECISION") {
        lines.push(`- [ARCHITECTURAL STANDARD] ${item.title}: ${item.content}`)
      } else {
        lines.push(`- [LEARNED PATTERN] ${item.title}`)
      }
    }
    return lines.join("\n")
  }

  public getAll(): MemoryEntry[] {
    return Array.from(this.entries.values())
  }
}
