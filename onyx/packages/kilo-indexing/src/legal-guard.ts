export type DiagnosticSeverity = "ERROR" | "WARNING" | "INFO"

export interface LegalDiagnostic {
  readonly line: number
  readonly column: number
  readonly severity: DiagnosticSeverity
  readonly code: string
  readonly message: string
  readonly violationType:
    | "COPYLEFT_VIRAL"
    | "TOS_UNAUTHORIZED_SCRAPER"
    | "UNLICENSED_DEPENDENCY"
    | "NON_COMMERCIAL_RESTRICTED"
    | "PROPRIETARY_TRAP"
  readonly remediation: string
}

export interface LegalGuardAudit {
  readonly filePath: string
  readonly isCommerciallySafe: boolean
  readonly riskScore: number // 0 (clean) to 100 (critical)
  readonly diagnostics: readonly LegalDiagnostic[]
  readonly summary: string
}

const COPYLEFT_INDICATORS = [
  { pattern: /GNU\s+Affero\s+General\s+Public\s+License/i, code: "AGPL-3.0", severity: "ERROR" as const },
  { pattern: /AGPL-3\.0/i, code: "AGPL-3.0", severity: "ERROR" as const },
  { pattern: /Server\s+Side\s+Public\s+License/i, code: "SSPL-1.0", severity: "ERROR" as const },
  { pattern: /GNU\s+General\s+Public\s+License\s+v3/i, code: "GPL-3.0", severity: "WARNING" as const },
  { pattern: /GPL-3\.0/i, code: "GPL-3.0", severity: "WARNING" as const },
  { pattern: /Commons\s+Clause/i, code: "COMMONS-CLAUSE", severity: "ERROR" as const },
]

const NON_COMMERCIAL_INDICATORS = [
  {
    pattern: /solely\s+for\s+non-commercial|non-commercial\s+research\s+and\s+academic/i,
    code: "NON-COMMERCIAL-ONLY",
    severity: "ERROR" as const,
    message: "Non-commercial or research-only license restriction detected (e.g. aliasrobotics/cai pattern).",
    remediation: "Barred from commercial deployment. Replace with permissive MIT/Apache-2.0 certified cybersecurity skills.",
  },
  {
    pattern: /commercial.*production\s+use.*strictly\s+prohibited/i,
    code: "COMMERCIAL-USE-PROHIBITED",
    severity: "ERROR" as const,
    message: "Express prohibition against commercial or production use found in source/license text.",
    remediation: "Exclude entirely from commercial distribution. Use clean-room implementation.",
  },
  {
    pattern: /CC\s*BY-NC|CC-BY-NC-SA/i,
    code: "CC-BY-NC",
    severity: "ERROR" as const,
    message: "Creative Commons Non-Commercial (NC) restriction detected.",
    remediation: "Cannot be monetized or included in commercial SaaS products without express licensor grant.",
  },
]

const TOS_SCRAPER_INDICATORS = [
  { pattern: /facebook\.com.*cookie/i, message: "Unauthorized Facebook/Meta session cookie extraction detected" },
  { pattern: /meta\.ai.*session/i, message: "Unauthorized Meta AI credential scraping detected (CFAA/TOS hazard)" },
  { pattern: /bypass.*recaptcha|bypass.*cloudflare/i, message: "Anti-bot circumvention detected (TOS violation risk)" },
]

const PROPRIETARY_TRAP_INDICATORS = [
  {
    pattern: /may\s+not\s+resell\s+or\s+redistribute.*as\s+a\s+prompt\s+or\s+media\s+collection/i,
    code: "PROPRIETARY-MEDIA-CLAUSE",
    severity: "WARNING" as const,
    message: "Dual-license clause detected (e.g., Motionsites-AI/claude-skill). Media/examples are proprietary.",
    remediation: "Isolate code instructions; strip and omit proprietary examples/ and media/ directories from distribution.",
  },
]

export class LegalLicenseGuard {
  public auditSourceCode(filePath: string, content: string): LegalGuardAudit {
    const lines = content.split("\n")
    const diagnostics: LegalDiagnostic[] = []
    let riskScore = 0

    lines.forEach((lineText, index) => {
      const lineNum = index + 1

      // 1. Check Copyleft Licenses
      for (const indicator of COPYLEFT_INDICATORS) {
        if (indicator.pattern.test(lineText)) {
          const isError = indicator.severity === "ERROR"
          riskScore = Math.max(riskScore, isError ? 95 : 60)
          diagnostics.push({
            line: lineNum,
            column: 1,
            severity: indicator.severity,
            code: indicator.code,
            violationType: "COPYLEFT_VIRAL",
            message: `Viral copyleft license (${indicator.code}) detected. Incorporating this will obligate releasing proprietary commercial source code.`,
            remediation: `Isolate behind an independent gRPC/HTTP microservice boundary or replace with permissive MIT/Apache-2.0 alternative.`,
          })
        }
      }

      // 2. Check Non-commercial / Research-only clauses (e.g. aliasrobotics/cai)
      for (const indicator of NON_COMMERCIAL_INDICATORS) {
        if (indicator.pattern.test(lineText)) {
          riskScore = Math.max(riskScore, 95)
          diagnostics.push({
            line: lineNum,
            column: 1,
            severity: indicator.severity,
            code: indicator.code,
            violationType: "NON_COMMERCIAL_RESTRICTED",
            message: indicator.message,
            remediation: indicator.remediation,
          })
        }
      }

      // 3. Check TOS / CFAA Scraper indicators
      for (const scraper of TOS_SCRAPER_INDICATORS) {
        if (scraper.pattern.test(lineText)) {
          riskScore = Math.max(riskScore, 90)
          diagnostics.push({
            line: lineNum,
            column: 1,
            severity: "ERROR",
            code: "TOS-SCRAPER-RISK",
            violationType: "TOS_UNAUTHORIZED_SCRAPER",
            message: scraper.message,
            remediation: "Replace unauthorized scraping with sanctioned official API endpoints and OAuth credentials.",
          })
        }
      }

      // 4. Check Proprietary Traps (e.g. Motionsites media clause)
      for (const trap of PROPRIETARY_TRAP_INDICATORS) {
        if (trap.pattern.test(lineText)) {
          riskScore = Math.max(riskScore, 55)
          diagnostics.push({
            line: lineNum,
            column: 1,
            severity: trap.severity,
            code: trap.code,
            violationType: "PROPRIETARY_TRAP",
            message: trap.message,
            remediation: trap.remediation,
          })
        }
      }
    })

    const isCommerciallySafe = riskScore < 50
    const summary = isCommerciallySafe
      ? "Code passed commercial legal audit: No copyleft viral contagion, non-commercial restrictions, or TOS liabilities found."
      : `CRITICAL LEGAL HAZARD: Found ${diagnostics.length} violation(s). Risk score: ${riskScore}/100.`

    return {
      filePath,
      isCommerciallySafe,
      riskScore,
      diagnostics,
      summary,
    }
  }

  public auditDependencies(packageJsonContent: string): LegalGuardAudit {
    const diagnostics: LegalDiagnostic[] = []
    let riskScore = 0

    try {
      const pkg = JSON.parse(packageJsonContent)
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      }

      // Known risky copyleft and prohibited libraries
      const KNOWN_HAZARDOUS_PACKAGES: Record<string, { license: string; violationType: LegalDiagnostic["violationType"]; safeAlternative: string }> = {
        "ghostscript-node": { license: "AGPL-3.0", violationType: "COPYLEFT_VIRAL", safeAlternative: "pdf-lib or pdfjs-dist (MIT)" },
        "weaviate-client-v2": { license: "AGPL-3.0", violationType: "COPYLEFT_VIRAL", safeAlternative: "pgvector or qdrant (Apache-2.0)" },
        "mike-legal-core": { license: "AGPL-3.0", violationType: "COPYLEFT_VIRAL", safeAlternative: "clean-room document parser" },
        "open-legal-products/mike": { license: "AGPL-3.0", violationType: "COPYLEFT_VIRAL", safeAlternative: "clean-room legal engine (MIT)" },
        "openemm": { license: "AGPL-3.0", violationType: "COPYLEFT_VIRAL", safeAlternative: "clean-room email connector (MIT) / Resend" },
        "agnitas-org/openemm": { license: "AGPL-3.0", violationType: "COPYLEFT_VIRAL", safeAlternative: "clean-room email connector (MIT) / Resend" },
        "aliasrobotics/cai": { license: "PROPRIETARY_RESEARCH_ONLY", violationType: "NON_COMMERCIAL_RESTRICTED", safeAlternative: "Anthropic Cybersecurity Skills (Apache-2.0)" },
        "compnew2006/MetaAI-Free-Hermes-Agent": { license: "UNAUTHORIZED_SCRAPER", violationType: "TOS_UNAUTHORIZED_SCRAPER", safeAlternative: "Ollama Local Inference or Meta Llama official API" },
      }

      for (const [depName] of Object.entries(allDeps)) {
        if (KNOWN_HAZARDOUS_PACKAGES[depName]) {
          const info = KNOWN_HAZARDOUS_PACKAGES[depName]
          riskScore = 95
          diagnostics.push({
            line: 1,
            column: 1,
            severity: "ERROR",
            code: info.license,
            violationType: info.violationType,
            message: `Dependency '${depName}' has legal status '${info.license}' which is prohibited in commercial Onyx builds.`,
            remediation: `Remove dependency and migrate to ${info.safeAlternative}.`,
          })
        }
      }
    } catch {
      // Ignored for non-json
    }

    return {
      filePath: "package.json",
      isCommerciallySafe: riskScore < 50,
      riskScore,
      diagnostics,
      summary: riskScore < 50 ? "Dependencies clean." : `Found ${diagnostics.length} hazardous dependencies.`,
    }
  }
}
