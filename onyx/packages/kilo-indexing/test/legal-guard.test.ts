import { describe, expect, test } from "bun:test"
import { LegalLicenseGuard } from "../src/legal-guard"

describe("Real-Time Legal & License Guard (Upgrade 2)", () => {
  const guard = new LegalLicenseGuard()

  test("should detect AGPL-3.0 header and output ERROR diagnostics with line number", () => {
    const code = `
      // Copyright (c) 2026
      // Licensed under the GNU Affero General Public License (AGPL-3.0)
      export function parseContracts() {}
    `
    const audit = guard.auditSourceCode("src/contract.ts", code)
    expect(audit.isCommerciallySafe).toBe(false)
    expect(audit.riskScore).toBe(95)
    expect(audit.diagnostics.length).toBeGreaterThanOrEqual(1)
    expect(audit.diagnostics[0].severity).toBe("ERROR")
    expect(audit.diagnostics[0].line).toBe(3)
  })

  test("should pass permissive MIT / Apache 2.0 files with clean score", () => {
    const code = `
      /**
       * MIT License
       * Copyright (c) 2026 Onyx Team
       */
      export const add = (a: number, b: number) => a + b
    `
    const audit = guard.auditSourceCode("src/math.ts", code)
    expect(audit.isCommerciallySafe).toBe(true)
    expect(audit.riskScore).toBe(0)
    expect(audit.diagnostics.length).toBe(0)
  })

  test("should flag unauthorized scraper cookies or CFAA violations", () => {
    const code = `
      const cookie = "datr=abc; meta.ai.session=xyz;"
      fetch("https://meta.ai/api/chat", { headers: { cookie } })
    `
    const audit = guard.auditSourceCode("src/scraper.ts", code)
    expect(audit.isCommerciallySafe).toBe(false)
    expect(audit.diagnostics.some((d) => d.violationType === "TOS_UNAUTHORIZED_SCRAPER")).toBe(true)
  })

  test("should audit package.json for viral copyleft dependencies", () => {
    const pkg = JSON.stringify({
      dependencies: {
        "ghostscript-node": "^1.0.0",
        lodash: "^4.17.21",
      },
    })
    const audit = guard.auditDependencies(pkg)
    expect(audit.isCommerciallySafe).toBe(false)
    expect(audit.diagnostics[0].code).toBe("AGPL-3.0")
    expect(audit.diagnostics[0].remediation).toContain("pdf-lib")
  })

  test("should detect research-only non-commercial restrictions (e.g. aliasrobotics/cai)", () => {
    const code = `
      /**
       * Permission is granted to use and modify solely for non-commercial research and academic purposes.
       * Commercial, professional, or production use of these components is strictly prohibited.
       */
      export function auditRobotSecurity() {}
    `
    const audit = guard.auditSourceCode("src/robot-sec.ts", code)
    expect(audit.isCommerciallySafe).toBe(false)
    expect(audit.riskScore).toBe(95)
    expect(audit.diagnostics.some((d) => d.violationType === "NON_COMMERCIAL_RESTRICTED")).toBe(true)
    expect(audit.diagnostics[0].remediation).toContain("permissive MIT/Apache-2.0")
  })

  test("should detect prohibited dependencies in package.json (e.g. openemm, aliasrobotics/cai)", () => {
    const pkg = JSON.stringify({
      dependencies: {
        "agnitas-org/openemm": "24.0.0",
        "aliasrobotics/cai": "1.0.0",
        react: "^19.0.0",
      },
    })
    const audit = guard.auditDependencies(pkg)
    expect(audit.isCommerciallySafe).toBe(false)
    expect(audit.diagnostics.length).toBe(2)
    expect(audit.diagnostics.some((d) => d.code === "AGPL-3.0")).toBe(true)
    expect(audit.diagnostics.some((d) => d.code === "PROPRIETARY_RESEARCH_ONLY")).toBe(true)
  })

  test("should detect proprietary media traps (Motionsites-AI claude-skill clause)", () => {
    const code = `
      // Note: You may not resell or redistribute them as a prompt or media collection.
      export const promptTemplates = []
    `
    const audit = guard.auditSourceCode("skills/motionsites.ts", code)
    expect(audit.diagnostics.some((d) => d.violationType === "PROPRIETARY_TRAP")).toBe(true)
    expect(audit.diagnostics[0].severity).toBe("WARNING")
  })
})
