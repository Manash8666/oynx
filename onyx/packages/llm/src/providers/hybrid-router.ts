import { openModelRegistry, type OpenModelMetadata } from "./open-model-registry"

export type RoutingTier = "LOCAL_FAST" | "LOCAL_REASONING" | "CLOUD_DEEP_REASONING" | "CLOUD_VISION"

export type PrivacyMode = "airgap" | "strict" | "balanced" | "cloud_first"

export interface TaskClassification {
  readonly query: string
  readonly privacyMode: PrivacyMode
  readonly tier: RoutingTier
  readonly recommendedModel: OpenModelMetadata
  readonly reason: string
  readonly estimatedTokens: number
  readonly isZeroCost: boolean
}

export interface RoutingStats {
  totalRequests: number
  localRequests: number
  cloudRequests: number
  tokensSavedLocally: number
  estimatedMoneySavedUsd: number
}

export class HybridModelRouter {
  private stats: RoutingStats = {
    totalRequests: 0,
    localRequests: 0,
    cloudRequests: 0,
    tokensSavedLocally: 0,
    estimatedMoneySavedUsd: 0,
  }

  constructor(private readonly defaultPrivacy: PrivacyMode = "balanced") {}

  /**
   * Evaluates prompt complexity, privacy constraints, and intent to select the optimal model.
   */
  public classifyAndRoute(
    prompt: string,
    options?: {
      hasImages?: boolean
      isMultiFile?: boolean
      forcedPrivacy?: PrivacyMode
      estimatedTokenLength?: number
    }
  ): TaskClassification {
    const privacy = options?.forcedPrivacy ?? this.defaultPrivacy
    const promptLen = prompt.length
    const estimatedTokens = options?.estimatedTokenLength ?? Math.ceil(promptLen / 4)
    const lower = prompt.toLowerCase()

    // 1. Airgap or Strict Privacy: ALWAYS route locally
    if (privacy === "airgap" || privacy === "strict") {
      const localModel =
        openModelRegistry.get("qwen3-coder") ?? openModelRegistry.list()[0]
      return {
        query: prompt,
        privacyMode: privacy,
        tier: "LOCAL_FAST",
        recommendedModel: localModel,
        reason: `Privacy mode '${privacy}' enforces 100% on-device local execution.`,
        estimatedTokens,
        isZeroCost: true,
      }
    }

    // 2. Vision requests
    if (options?.hasImages || lower.includes("screenshot") || lower.includes("image") || lower.includes("diagram")) {
      const visionModel = openModelRegistry.get("qwen3-vl") ?? openModelRegistry.list()[1]
      return {
        query: prompt,
        privacyMode: privacy,
        tier: "CLOUD_VISION",
        recommendedModel: visionModel,
        reason: "Visual reasoning required (UI screenshot / diagram analysis).",
        estimatedTokens,
        isZeroCost: false,
      }
    }

    // 3. Complex architectural / systemic tasks
    const isArchitectural =
      options?.isMultiFile ||
      lower.includes("architect") ||
      lower.includes("monorepo") ||
      lower.includes("system design") ||
      lower.includes("migration") ||
      lower.includes("refactor entire") ||
      lower.includes("distributed system")

    if (isArchitectural && privacy !== "strict") {
      const reasoningModel = openModelRegistry.get("deepseek-r1") ?? openModelRegistry.list()[0]
      return {
        query: prompt,
        privacyMode: privacy,
        tier: "CLOUD_DEEP_REASONING",
        recommendedModel: reasoningModel,
        reason: "Multi-file structural refactoring requires frontier deep reasoning model.",
        estimatedTokens,
        isZeroCost: false,
      }
    }

    // 4. Default: Fast Local Ollama execution for syntax, functions, tests, docs
    const localFast = openModelRegistry.get("qwen3-coder") ?? openModelRegistry.list()[0]
    return {
      query: prompt,
      privacyMode: privacy,
      tier: "LOCAL_FAST",
      recommendedModel: localFast,
      reason: "Standard code generation, debugging, or explanation routed locally for $0.00 cost and zero cloud latency.",
      estimatedTokens,
      isZeroCost: true,
    }
  }

  /**
   * Records execution outcome in ledger and updates financial/token metrics.
   */
  public recordExecution(classification: TaskClassification, tokensUsed: number): void {
    this.stats.totalRequests++
    if (classification.isZeroCost) {
      this.stats.localRequests++
      this.stats.tokensSavedLocally += tokensUsed
      // Assuming commercial cloud API rate of $0.015 per 1,000 tokens ($15 / 1M)
      this.stats.estimatedMoneySavedUsd = Number(
        ((this.stats.tokensSavedLocally / 1000) * 0.015).toFixed(4)
      )
    } else {
      this.stats.cloudRequests++
    }
  }

  public getStats(): Readonly<RoutingStats> {
    return { ...this.stats }
  }
}
