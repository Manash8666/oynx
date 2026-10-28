import { describe, expect, test } from "bun:test"
import { CleanRoomLegalEngine } from "../src/legal/clean-room-legal-engine"

describe("Clean-Room Legal & Contract Engine (MIT Replacement for AGPL mike)", () => {
  const engine = new CleanRoomLegalEngine()

  test("should extract limitation of liability clauses and detect uncapped liabilities", () => {
    const dangerousContract = `
      1. Limitation of Liability.
      The vendor's liability shall not be limited and vendor shall bear unlimited liability for any claims.
    `
    const report = engine.analyzeContract("Vendor Agreement", dangerousContract)
    expect(report.isCommercialSafe).toBe(false)
    expect(report.criticalRedFlags.length).toBeGreaterThan(0)
    expect(report.overallRiskScore).toBeGreaterThanOrEqual(40)
    expect(report.extractedClauses.some((c) => c.type === "LIMITATION_OF_LIABILITY" && c.riskLevel === "CRITICAL")).toBe(true)
  })

  test("should approve safe commercial terms with capped liability and customer IP ownership", () => {
    const safeContract = `
      Section 4. Intellectual Property.
      Customer retains all rights, title, and interest in and to Customer Code, data, and models.
      Section 8. Limitation of Liability.
      Each party's aggregate liability under this agreement shall not exceed the aggregate fees paid in the preceding 12 months.
      Section 9. Indemnification.
      Each party shall indemnify and hold harmless the other party for third-party intellectual property infringement claims.
    `
    const report = engine.analyzeContract("Standard Enterprise SaaS Agreement", safeContract)
    expect(report.isCommercialSafe).toBe(true)
    expect(report.criticalRedFlags.length).toBe(0)
    expect(report.overallRiskScore).toBeLessThanOrEqual(25)
  })

  test("should detect and flag non-compete covenants as critical hazards", () => {
    const nonCompeteContract = `
      Section 12. Non-Compete.
      During the term and for 2 years thereafter, the company shall not directly or indirectly engage in or develop competing software tools.
    `
    const report = engine.analyzeContract("Restrictive Agreement", nonCompeteContract)
    expect(report.isCommercialSafe).toBe(false)
    expect(report.extractedClauses.some((c) => c.type === "NON_COMPETE")).toBe(true)
  })

  test("should verify license compatibility between MIT/Apache and Proprietary", () => {
    const mitToProp = engine.verifyLicenseCompatibility("MIT", "Proprietary", "STATIC")
    expect(mitToProp.isCompatible).toBe(true)
    expect(mitToProp.riskSeverity).toBe("LOW")

    const apacheToProp = engine.verifyLicenseCompatibility("Apache-2.0", "Proprietary", "STATIC")
    expect(apacheToProp.isCompatible).toBe(true)
  })

  test("should forbid AGPL-3.0 and SSPL-1.0 in proprietary commercial platform", () => {
    const agplCheck = engine.verifyLicenseCompatibility("AGPL-3.0", "Proprietary", "STATIC")
    expect(agplCheck.isCompatible).toBe(false)
    expect(agplCheck.riskSeverity).toBe("FORBIDDEN")
    expect(agplCheck.explanation).toContain("STRICTLY PROHIBITED")

    const agplNetworkCheck = engine.verifyLicenseCompatibility("AGPL-3.0", "Proprietary", "NETWORK_API")
    expect(agplNetworkCheck.isCompatible).toBe(false)
    expect(agplNetworkCheck.explanation).toContain("viral network trigger")
  })

  test("should forbid CC-BY-NC non-commercial licenses in commercial platform", () => {
    const ccCheck = engine.verifyLicenseCompatibility("CC-BY-NC", "Proprietary", "STATIC")
    expect(ccCheck.isCompatible).toBe(false)
    expect(ccCheck.riskSeverity).toBe("FORBIDDEN")
  })
})
