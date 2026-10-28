export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN"

export interface CircuitBreakerConfig {
  readonly failureThreshold: number
  readonly resetTimeoutMs: number
  readonly baseRetryDelayMs: number
  readonly maxRetries: number
}

export class ProviderCircuitBreakerThrottler {
  private state: CircuitState = "CLOSED"
  private failureCount = 0
  private lastFailureTime = 0

  constructor(
    private readonly config: CircuitBreakerConfig = {
      failureThreshold: 3,
      resetTimeoutMs: 10000,
      baseRetryDelayMs: 200,
      maxRetries: 3,
    }
  ) {}

  public getState(): CircuitState {
    if (this.state === "OPEN" && Date.now() - this.lastFailureTime > this.config.resetTimeoutMs) {
      this.state = "HALF_OPEN"
    }
    return this.state
  }

  public recordSuccess(): void {
    this.failureCount = 0
    this.state = "CLOSED"
  }

  public recordFailure(): CircuitState {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = "OPEN"
    }
    return this.state
  }

  /**
   * Calculates exponential backoff with randomized jitter to prevent API stampedes.
   */
  public calculateBackoffDelay(attempt: number): number {
    const exponential = this.config.baseRetryDelayMs * Math.pow(2, attempt)
    const jitter = Math.random() * (this.config.baseRetryDelayMs / 2)
    return Math.floor(exponential + jitter)
  }

  /**
   * Evaluates prompt cache eligibility and injects ephemeral cache markers for long context blocks.
   */
  public injectPromptCacheHeaders<T extends { messages: Array<{ role: string; content: string }> }>(
    payload: T
  ): T & { cachedTokensEstimated: number; cacheHeadersInjected: boolean } {
    let totalLength = 0
    for (const msg of payload.messages) {
      totalLength += msg.content.length
    }

    const estimatedTokens = Math.ceil(totalLength / 4)
    const isEligible = estimatedTokens >= 1024 // Prompt caching threshold

    return {
      ...payload,
      cachedTokensEstimated: isEligible ? Math.floor(estimatedTokens * 0.8) : 0,
      cacheHeadersInjected: isEligible,
    }
  }

  public shouldFallbackToLocal(): boolean {
    return this.getState() === "OPEN"
  }
}
