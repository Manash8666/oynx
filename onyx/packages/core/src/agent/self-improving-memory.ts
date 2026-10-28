export interface AgentExecutionRecord {
  readonly task: string
  readonly success: boolean
  readonly strategy: string
  readonly errorPattern?: string
  readonly language?: string
}

export interface LearningInsight {
  readonly id: string
  readonly task: string
  readonly strategy: string
  readonly language?: string
  readonly confidenceScore: number
}

export interface AntiPatternWarning {
  readonly id: string
  readonly antiPattern: string
  readonly suggestedFix: string
  readonly context: string
}

export interface MemoryConfig {
  readonly maxLearnings?: number
}

export class SelfImprovingMemory {
  private readonly records: AgentExecutionRecord[] = []
  private readonly maxLearnings: number

  constructor(config: MemoryConfig = {}) {
    this.maxLearnings = config.maxLearnings ?? 100
  }

  async recordOutcome(record: AgentExecutionRecord): Promise<void> {
    this.records.unshift(record)
    if (this.records.length > this.maxLearnings) {
      this.records.pop()
    }
  }

  async retrieveInsights(query: string): Promise<LearningInsight[]> {
    const terms = query.toLowerCase().split(/\s+/)
    const matches: LearningInsight[] = []

    for (let i = 0; i < this.records.length; i++) {
      const rec = this.records[i]
      if (!rec.success) continue

      const haystack = `${rec.task} ${rec.strategy} ${rec.language ?? ""}`.toLowerCase()
      const matchCount = terms.filter((term) => haystack.includes(term)).length

      if (matchCount > 0 || terms.length === 0) {
        matches.push({
          id: `insight-${i}`,
          task: rec.task,
          strategy: rec.strategy,
          language: rec.language,
          confidenceScore: Math.min(1.0, 0.7 + matchCount * 0.15),
        })
      }
    }

    return matches.sort((a, b) => b.confidenceScore - a.confidenceScore)
  }

  async retrieveWarnings(query: string): Promise<AntiPatternWarning[]> {
    const terms = query.toLowerCase().split(/\s+/)
    const warnings: AntiPatternWarning[] = []

    for (let i = 0; i < this.records.length; i++) {
      const rec = this.records[i]
      if (rec.success) continue

      const haystack = `${rec.task} ${rec.strategy} ${rec.errorPattern ?? ""}`.toLowerCase()
      const matchCount = terms.filter((term) => haystack.includes(term)).length

      if (matchCount > 0 || terms.length === 0) {
        warnings.push({
          id: `warning-${i}`,
          antiPattern: rec.errorPattern ?? rec.strategy,
          suggestedFix: `Avoid strategy: "${rec.strategy}". Verify prerequisites before re-executing.`,
          context: rec.task,
        })
      }
    }

    return warnings
  }
}

