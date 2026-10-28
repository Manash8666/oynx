import { describe, expect, test } from "bun:test"
import { HybridModelRouter } from "../src/providers/hybrid-router"

describe("Smart Hybrid Model Router & Token Ledger (Upgrade 1)", () => {
  const router = new HybridModelRouter("balanced")

  test("should route simple code fixes to Local Ollama ($0.00 cost)", () => {
    const result = router.classifyAndRoute("Write a TypeScript function to debounce an event")
    expect(result.tier).toBe("LOCAL_FAST")
    expect(result.isZeroCost).toBe(true)
    expect(result.recommendedModel.provider).toBe("ollama")
  })

  test("should force 100% local execution when privacy mode is airgap or strict", () => {
    const result = router.classifyAndRoute("Refactor entire distributed microservices architecture", {
      isMultiFile: true,
      forcedPrivacy: "strict",
    })
    expect(result.tier).toBe("LOCAL_FAST")
    expect(result.isZeroCost).toBe(true)
    expect(result.privacyMode).toBe("strict")
  })

  test("should route complex multi-file architectural prompts to Cloud Deep Reasoning", () => {
    const result = router.classifyAndRoute("System design and refactor entire database migration layer", {
      isMultiFile: true,
      forcedPrivacy: "balanced",
    })
    expect(result.tier).toBe("CLOUD_DEEP_REASONING")
    expect(result.isZeroCost).toBe(false)
    expect(result.recommendedModel.supportsReasoning).toBe(true)
  })

  test("should route image and screenshot queries to Cloud Vision", () => {
    const result = router.classifyAndRoute("Convert this UI screenshot into a Tailwind component", {
      hasImages: true,
    })
    expect(result.tier).toBe("CLOUD_VISION")
    expect(result.recommendedModel.supportsVision).toBe(true)
  })

  test("should record token usage and track financial savings in ledger", () => {
    const localTask = router.classifyAndRoute("Write unit test for auth helper")
    router.recordExecution(localTask, 2000)
    const stats = router.getStats()

    expect(stats.totalRequests).toBeGreaterThanOrEqual(1)
    expect(stats.localRequests).toBeGreaterThanOrEqual(1)
    expect(stats.tokensSavedLocally).toBe(2000)
    expect(stats.estimatedMoneySavedUsd).toBe(0.03) // 2k * $0.015/1k
  })
})
