import { describe, expect, test } from "bun:test"
import { CybersecuritySkillsEngine } from "../src/security/cybersecurity-skills"

describe("Cybersecurity Agent Skills (Apache-2.0, MITRE & NIST Mapped)", () => {
  test("should load catalog mapped to MITRE ATT&CK, NIST CSF, and OWASP", () => {
    const catalog = CybersecuritySkillsEngine.getCatalog()
    expect(catalog.length).toBeGreaterThanOrEqual(4)

    const frameworks = catalog.map((c) => c.framework)
    expect(frameworks).toContain("MITRE_ATTACK")
    expect(frameworks).toContain("OWASP_TOP_10")
    expect(frameworks).toContain("NIST_AI_RMF")
  })

  test("should flag hardcoded API keys according to MITRE T1552 technique", () => {
    const insecureCode = `const apiKey = "sk-ant-api03-abcdef123456789012345678901234567890";`
    const audit = CybersecuritySkillsEngine.evaluateCodeSecurity(insecureCode)

    expect(audit.isSecure).toBe(false)
    expect(audit.findings[0].skill.mitreTechniqueId).toBe("T1552")
  })

  test("should flag SQL injection vulnerabilities according to OWASP A03", () => {
    const sqlInjectionCode = "const query = `SELECT * FROM users WHERE id = ${userId}`;"
    const audit = CybersecuritySkillsEngine.evaluateCodeSecurity(sqlInjectionCode)

    expect(audit.isSecure).toBe(false)
    expect(audit.findings[0].skill.framework).toBe("OWASP_TOP_10")
    expect(audit.findings[0].skill.remediationPrompt).toContain("parameterized")
  })

  test("should pass clean code with zero findings", () => {
    const secureCode = `const query = "SELECT * FROM users WHERE id = :id";`
    const audit = CybersecuritySkillsEngine.evaluateCodeSecurity(secureCode)

    expect(audit.isSecure).toBe(true)
    expect(audit.findings.length).toBe(0)
  })
})
