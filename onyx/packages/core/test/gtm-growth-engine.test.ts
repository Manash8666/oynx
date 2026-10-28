import { describe, expect, test } from "bun:test"
import { GtmGrowthEngine } from "../src/gtm/gtm-growth-engine"

describe("Autonomous GTM & Growth Engine (MIT-Licensed Ingestion)", () => {
  const gtm = new GtmGrowthEngine()

  test("should load the 6-phase reality-gated GTM sprint milestones", () => {
    const playbook = GtmGrowthEngine.getPlaybook()
    expect(playbook.length).toBe(6)

    const phases = playbook.map((p) => p.phase)
    expect(phases).toContain("ICP_VALIDATION")
    expect(phases).toContain("VALUE_PROPOSITION")
    expect(phases).toContain("LANDING_PAGE_CRO")
    expect(phases).toContain("OUTBOUND_SEQUENCE")
    expect(phases).toContain("SEO_GROWTH_ENGINE")
    expect(phases).toContain("RETENTION_METRICS")
  })

  test("should audit marketing copy, penalizing buzzwords and rewarding strong CTAs", () => {
    // Bad copy full of buzzwords
    const buzzwordCopy = "Our cutting-edge revolutionary platform provides synergy and game-changer features for everything you need."
    const badAudit = gtm.auditMarketingCopy(buzzwordCopy)

    expect(badAudit.jargonPenalty).toBeGreaterThan(0)
    expect(badAudit.recommendations.some((r) => r.includes("buzzword"))).toBe(true)

    // Good clear copy
    const clearCopy = "Build commercial AI IDE applications with zero data leaks and $0 local token costs. Get started with one click."
    const goodAudit = gtm.auditMarketingCopy(clearCopy)

    expect(goodAudit.jargonPenalty).toBe(0)
    expect(goodAudit.ctaScore).toBe(90)
    expect(goodAudit.overallRating).toBe("EXCELLENT")
  })

  test("should generate a 3-touch hyper-personalized outbound email sequence", () => {
    const sequence = gtm.generateOutboundSequence("Onyx Code", "Engineering VP", "Local Airgapped LLM Execution")
    expect(sequence.length).toBe(3)
    expect(sequence[0].touchNumber).toBe(1)
    expect(sequence[0].body).toContain("Onyx Code")
    expect(sequence[2].subject).toContain("Closing the loop")
  })
})
