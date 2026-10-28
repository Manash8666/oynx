/**
 * Clean-Room Legal & Contract Analysis Engine
 *
 * 100% Permissive MIT Architecture - Clean-Room replacement for copyleft AGPL libraries (e.g. open-legal-products/mike).
 * Provides commercial contract clause extraction, liability analysis, risk scoring,
 * and software license compatibility verification for enterprise AI IDE operations.
 */

export type ClauseType =
  | "CONFIDENTIALITY"
  | "INTELLECTUAL_PROPERTY"
  | "INDEMNIFICATION"
  | "LIMITATION_OF_LIABILITY"
  | "WARRANTY_DISCLAIMER"
  | "TERM_AND_TERMINATION"
  | "GOVERNING_LAW"
  | "NON_COMPETE"
  | "LICENSE_GRANT"

export type ClauseRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export interface ExtractedClause {
  readonly id: string
  readonly type: ClauseType
  readonly textSnippet: string
  readonly riskLevel: ClauseRiskLevel
  readonly title: string
  readonly summary: string
  readonly redFlags: readonly string[]
  readonly recommendation: string
}

export type SoftwareLicenseType =
  | "MIT"
  | "Apache-2.0"
  | "BSD-2-Clause"
  | "BSD-3-Clause"
  | "ISC"
  | "MPL-2.0"
  | "LGPL-3.0"
  | "GPL-3.0"
  | "AGPL-3.0"
  | "SSPL-1.0"
  | "Commons-Clause"
  | "CC-BY-NC"
  | "Proprietary"

export interface LicenseCompatibilityCheck {
  readonly sourceLicense: SoftwareLicenseType
  readonly targetLicense: SoftwareLicenseType
  readonly isCompatible: boolean
  readonly linkingType: "STATIC" | "DYNAMIC" | "NETWORK_API"
  readonly riskSeverity: "NONE" | "LOW" | "HIGH" | "FORBIDDEN"
  readonly explanation: string
}

export interface ContractAuditReport {
  readonly title: string
  readonly isCommercialSafe: boolean
  readonly overallRiskScore: number // 0 (safest) - 100 (highest risk)
  readonly extractedClauses: readonly ExtractedClause[]
  readonly criticalRedFlags: readonly string[]
  readonly licenseCompatibility?: readonly LicenseCompatibilityCheck[]
  readonly auditedAt: string
}

export class CleanRoomLegalEngine {
  /**
   * Analyzes legal text, commercial vendor agreements, NDAs, or SaaS terms.
   */
  public analyzeContract(title: string, content: string): ContractAuditReport {
    const extractedClauses: ExtractedClause[] = []
    const criticalRedFlags: string[] = []
    let totalRiskScore = 0

    // Clause 1: Limitation of Liability
    if (/limitation\s+of\s+liability|liable\s+for\s+any\s+(indirect|consequential|punitive)/i.test(content)) {
      const uncapped = /unlimited\s+liability|liability\s+shall\s+not\s+be\s+limited/i.test(content)
      const capMatch = content.match(/aggregate\s+liability.*(?:exceed|\$|fees\s+paid)/i)
      const risk: ClauseRiskLevel = uncapped ? "CRITICAL" : capMatch ? "LOW" : "MEDIUM"
      const flags: string[] = []
      if (uncapped) {
        flags.push("Uncapped liability detected without maximum ceiling.")
        criticalRedFlags.push("Vendor contract contains uncapped liability exposure.")
      }

      extractedClauses.push({
        id: "clause-liability",
        type: "LIMITATION_OF_LIABILITY",
        textSnippet: capMatch ? capMatch[0] : "Limitation of liability provision",
        riskLevel: risk,
        title: "Limitation of Liability",
        summary: uncapped
          ? "Uncapped monetary liability creates unlimited legal financial risk."
          : "Standard mutual liability limitation capping aggregate exposure.",
        redFlags: flags,
        recommendation: uncapped
          ? "Negotiate a strict monetary cap (e.g. 12 months fees paid or standard commercial aggregate)."
          : "Standard commercial term. Acceptable.",
      })
      totalRiskScore += uncapped ? 40 : 5
    } else {
      extractedClauses.push({
        id: "clause-liability-missing",
        type: "LIMITATION_OF_LIABILITY",
        textSnippet: "None",
        riskLevel: "HIGH",
        title: "Missing Limitation of Liability",
        summary: "No express limitation of liability clause found.",
        redFlags: ["Missing liability ceiling leaves the business vulnerable to uncapped common-law damages."],
        recommendation: "Mandate mutual limitation of liability clause capped at 12 months fees.",
      })
      totalRiskScore += 25
      criticalRedFlags.push("Missing limitation of liability ceiling.")
    }

    // Clause 2: Intellectual Property & Ownership
    if (/intellectual\s+property|ownership\s+of\s+(work\s+product|ip)|work\s+made\s+for\s+hire/i.test(content)) {
      const assignmentRisk = /assigns\s+all\s+(rights|inventions)|sole\s+and\s+exclusive\s+property/i.test(content)
      const reservedCustomer = /customer\s+retains\s+all\s+rights|licensee\s+owns/i.test(content)
      const risk: ClauseRiskLevel = assignmentRisk && !reservedCustomer ? "HIGH" : "LOW"
      const flags: string[] = []
      if (assignmentRisk && !reservedCustomer) {
        flags.push("Broad IP assignment may grant vendor ownership over your proprietary code or artifacts.")
        criticalRedFlags.push("Broad IP assignment risk to external party.")
      }

      extractedClauses.push({
        id: "clause-ip",
        type: "INTELLECTUAL_PROPERTY",
        textSnippet: "Intellectual Property Ownership clause",
        riskLevel: risk,
        title: "Intellectual Property Rights",
        summary: reservedCustomer
          ? "Explicit customer ownership of proprietary code, data, and models retained."
          : "Broad IP transfer language detected.",
        redFlags: flags,
        recommendation: "Ensure terms explicitly state that customer code, prompts, and output artifacts remain 100% customer property.",
      })
      totalRiskScore += risk === "HIGH" ? 30 : 0
    }

    // Clause 3: Non-Compete & Exclusivity
    if (/non-compete|shall\s+not\s+(directly\s+or\s+indirectly\s+engage|develop\s+competing)|exclusive\s+partnership/i.test(content)) {
      extractedClauses.push({
        id: "clause-noncompete",
        type: "NON_COMPETE",
        textSnippet: "Non-compete covenant",
        riskLevel: "CRITICAL",
        title: "Restrictive Non-Compete Covenant",
        summary: "Clause restricts business from developing competing AI tools or commercial software.",
        redFlags: ["Prohibits developing competing AI development platforms or developer tools."],
        recommendation: "Strike non-compete completely. Commercial software vendors should never agree to non-competes.",
      })
      totalRiskScore += 45
      criticalRedFlags.push("Restrictive non-compete covenant restricts future product development.")
    }

    // Clause 4: Indemnification
    if (/indemnif|hold\s+harmless|defend\s+and\s+indemnify/i.test(content)) {
      const mutual = /mutual\s+indemnif|each\s+party\s+shall\s+indemnify/i.test(content)
      const ipIndemnity = /infringement\s+of\s+third[- ]party\s+intellectual\s+property/i.test(content)

      extractedClauses.push({
        id: "clause-indemnity",
        type: "INDEMNIFICATION",
        textSnippet: "Indemnification covenant",
        riskLevel: !mutual && !ipIndemnity ? "HIGH" : "LOW",
        title: "Indemnification Obligations",
        summary: mutual
          ? "Balanced mutual indemnification covering third-party IP infringement."
          : "One-sided indemnification obligation detected.",
        redFlags: !mutual ? ["One-sided indemnification placing defense burdens solely on one party."] : [],
        recommendation: "Require mutual IP indemnification with customary notice, control of defense, and settlement consent.",
      })
      totalRiskScore += !mutual ? 20 : 0
    }

    // Normalize risk score (capped at 100)
    const overallRiskScore = Math.min(100, Math.max(0, totalRiskScore))
    const isCommercialSafe = overallRiskScore <= 35 && criticalRedFlags.length === 0

    return {
      title,
      isCommercialSafe,
      overallRiskScore,
      extractedClauses,
      criticalRedFlags,
      auditedAt: new Date().toISOString(),
    }
  }

  /**
   * Verifies open source and proprietary software license compatibility.
   */
  public verifyLicenseCompatibility(
    sourceLicense: SoftwareLicenseType,
    targetLicense: SoftwareLicenseType,
    linkingType: "STATIC" | "DYNAMIC" | "NETWORK_API" = "STATIC"
  ): LicenseCompatibilityCheck {
    // 1. Same license is always compatible
    if (sourceLicense === targetLicense) {
      return {
        sourceLicense,
        targetLicense,
        linkingType,
        isCompatible: true,
        riskSeverity: "NONE",
        explanation: `Identical licenses (${sourceLicense}) are 100% legally compatible.`,
      }
    }

    // 2. Permissive to Permissive (MIT, Apache-2.0, BSD-2/3, ISC)
    const isPermissive = (lic: SoftwareLicenseType) =>
      lic === "MIT" || lic === "Apache-2.0" || lic === "BSD-2-Clause" || lic === "BSD-3-Clause" || lic === "ISC"

    if (isPermissive(sourceLicense) && isPermissive(targetLicense)) {
      return {
        sourceLicense,
        targetLicense,
        linkingType,
        isCompatible: true,
        riskSeverity: "NONE",
        explanation: `Permissive licenses (${sourceLicense} and ${targetLicense}) can be combined freely in commercial projects. Retain original copyright notices.`,
      }
    }

    // 3. Permissive into Proprietary
    if (isPermissive(sourceLicense) && targetLicense === "Proprietary") {
      return {
        sourceLicense,
        targetLicense,
        linkingType,
        isCompatible: true,
        riskSeverity: "LOW",
        explanation: `Permissive open source (${sourceLicense}) can be incorporated into proprietary commercial software, provided copyright and attribution notices are preserved.`,
      }
    }

    // 4. AGPL-3.0 or SSPL-1.0 into Proprietary
    if (sourceLicense === "AGPL-3.0" || sourceLicense === "SSPL-1.0") {
      if (linkingType === "NETWORK_API") {
        return {
          sourceLicense,
          targetLicense,
          linkingType,
          isCompatible: false,
          riskSeverity: "FORBIDDEN",
          explanation: `CRITICAL HAZARD: ${sourceLicense} contains a viral network trigger (Section 13). Interacting over a network still risks copyleft obligations for the host platform. Clean-room alternative required.`,
        }
      }
      return {
        sourceLicense,
        targetLicense,
        linkingType,
        isCompatible: false,
        riskSeverity: "FORBIDDEN",
        explanation: `STRICTLY PROHIBITED: Incorporating ${sourceLicense} into proprietary commercial software forces open-sourcing the entire codebase under ${sourceLicense}.`,
      }
    }

    // 5. GPL-3.0 into Proprietary
    if (sourceLicense === "GPL-3.0" && targetLicense === "Proprietary") {
      if (linkingType === "NETWORK_API") {
        return {
          sourceLicense,
          targetLicense,
          linkingType,
          isCompatible: true,
          riskSeverity: "LOW",
          explanation: `Standard GPL-3.0 copyleft does not trigger across an independent network API or microservice boundary (unlike AGPL-3.0).`,
        }
      }
      return {
        sourceLicense,
        targetLicense,
        linkingType,
        isCompatible: false,
        riskSeverity: "FORBIDDEN",
        explanation: `Viral copyleft: Static or dynamic linking of GPL-3.0 code with proprietary software violates the GPL and obligates full source disclosure.`,
      }
    }

    // 6. Non-Commercial (CC-BY-NC) into Commercial / Proprietary
    if (sourceLicense === "CC-BY-NC" && targetLicense === "Proprietary") {
      return {
        sourceLicense,
        targetLicense,
        linkingType,
        isCompatible: false,
        riskSeverity: "FORBIDDEN",
        explanation: `PROHIBITED: CC-BY-NC strictly forbids commercial monetization. It cannot be bundled or distributed in a commercial product.`,
      }
    }

    // 7. LGPL-3.0 into Proprietary
    if (sourceLicense === "LGPL-3.0" && targetLicense === "Proprietary") {
      if (linkingType === "DYNAMIC" || linkingType === "NETWORK_API") {
        return {
          sourceLicense,
          targetLicense,
          linkingType,
          isCompatible: true,
          riskSeverity: "LOW",
          explanation: `LGPL-3.0 permits dynamic linking with proprietary code, provided users can replace or re-link the LGPL component.`,
        }
      }
      return {
        sourceLicense,
        targetLicense,
        linkingType,
        isCompatible: false,
        riskSeverity: "HIGH",
        explanation: `Static linking of LGPL-3.0 creates a derivative work that requires providing relinkable object code or source.`,
      }
    }

    // Default fallback
    return {
      sourceLicense,
      targetLicense,
      linkingType,
      isCompatible: true,
      riskSeverity: "LOW",
      explanation: `Combination between ${sourceLicense} and ${targetLicense} allowed under standard terms.`,
    }
  }
}
