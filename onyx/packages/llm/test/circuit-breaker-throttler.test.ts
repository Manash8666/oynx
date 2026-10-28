import { describe, expect, test } from "bun:test"
import { ProviderCircuitBreakerThrottler } from "../src/providers/circuit-breaker-throttler"

describe("Pillar 4: Provider Circuit Breaker, Throttling & Prompt Caching (KiloCode Inspired)", () => {
  const breaker = new ProviderCircuitBreakerThrottler({
    failureThreshold: 2,
    resetTimeoutMs: 100,
    baseRetryDelayMs: 50,
    maxRetries: 3,
  })

  test("should trip circuit to OPEN and trigger local fallback after exceeding failure threshold", () => {
    expect(breaker.getState()).toBe("CLOSED")
    expect(breaker.shouldFallbackToLocal()).toBe(false)

    breaker.recordFailure()
    expect(breaker.getState()).toBe("CLOSED")

    // Second failure triggers threshold
    breaker.recordFailure()
    expect(breaker.getState()).toBe("OPEN")
    expect(breaker.shouldFallbackToLocal()).toBe(true)
  })

  test("should calculate exponential backoff delay with jitter", () => {
    const delay0 = breaker.calculateBackoffDelay(0)
    const delay1 = breaker.calculateBackoffDelay(1)
    const delay2 = breaker.calculateBackoffDelay(2)

    expect(delay0).toBeGreaterThanOrEqual(50)
    expect(delay1).toBeGreaterThanOrEqual(100)
    expect(delay2).toBeGreaterThanOrEqual(200)
  })

  test("should inject prompt cache headers when context exceeds 1024 tokens", () => {
    const longContent = "A".repeat(5000) // ~1250 tokens
    const result = breaker.injectPromptCacheHeaders({
      messages: [{ role: "system", content: longContent }],
    })

    expect(result.cacheHeadersInjected).toBe(true)
    expect(result.cachedTokensEstimated).toBeGreaterThan(0)
  })
})
