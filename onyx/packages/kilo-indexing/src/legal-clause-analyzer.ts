export interface LegalRiskAssessment {
  readonly licenseDetected: string
  readonly hasCopyleftRisk: boolean
  readonly hasTOSViolationRisk: boolean
  readonly isCommercialSafe: boolean
  readonly recommendation: string
}

export const analyzeLegalCompliance = (text: string): LegalRiskAssessment => {
  const lower = text.toLowerCase()

  // 1. Check for Scraping / Reverse Engineering / TOS Violations
  const isScraperPattern =
    (lower.includes("cookie") && lower.includes("without an official api key")) ||
    (lower.includes("cookies from") && lower.includes("free requests")) ||
    (lower.includes("educational purposes only") && lower.includes("without"))

  if (isScraperPattern) {
    return {
      licenseDetected: "Unknown / Unofficial Integration",
      hasCopyleftRisk: false,
      hasTOSViolationRisk: true,
      isCommercialSafe: false,
      recommendation:
        "CRITICAL: Contains unofficial scraper patterns or educational-only disclaimer. Prohibited in commercial production.",
    }
  }

  // 2. Check for Strong Copyleft / AGPL / SSPL
  if (
    lower.includes("affero") ||
    lower.includes("agpl-3.0") ||
    lower.includes("agplv3") ||
    lower.includes("gnu affero general public license")
  ) {
    return {
      licenseDetected: "AGPL-3.0",
      hasCopyleftRisk: true,
      hasTOSViolationRisk: false,
      isCommercialSafe: false,
      recommendation:
        "HIGH RISK: AGPL-3.0 detected. isolate completely behind an independent network boundary or replace with MIT/Apache-2.0 to avoid viral source disclosure.",
    }
  }

  if (lower.includes("gnu general public license") || lower.includes("gpl-3.0") || lower.includes("gpl-2.0")) {
    return {
      licenseDetected: "GPL",
      hasCopyleftRisk: true,
      hasTOSViolationRisk: false,
      isCommercialSafe: false,
      recommendation:
        "COPYLEFT RISK: Standard GPL detected. Do not statically or dynamically link into proprietary application binaries.",
    }
  }

  // 3. Check for Permissive Licenses
  if (lower.includes("mit license") || lower.includes("permission is hereby granted, free of charge")) {
    return {
      licenseDetected: "MIT",
      hasCopyleftRisk: false,
      hasTOSViolationRisk: false,
      isCommercialSafe: true,
      recommendation: "APPROVED: Permissive MIT license. Safe for commercial and closed-source use.",
    }
  }

  if (lower.includes("apache license") || lower.includes("version 2.0, january 2004")) {
    return {
      licenseDetected: "Apache-2.0",
      hasCopyleftRisk: false,
      hasTOSViolationRisk: false,
      isCommercialSafe: true,
      recommendation:
        "APPROVED: Permissive Apache 2.0 license. Retain copyright notice, license copy, and patent grant.",
    }
  }

  return {
    licenseDetected: "Custom / Unspecified",
    hasCopyleftRisk: false,
    hasTOSViolationRisk: false,
    isCommercialSafe: true,
    recommendation: "Manual review recommended: No standard open-source license identified.",
  }
}
