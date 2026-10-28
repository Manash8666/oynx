export type FrameworkMapping = "MITRE_ATTACK" | "NIST_CSF" | "OWASP_TOP_10" | "NIST_AI_RMF"

export interface SecuritySkill {
  readonly id: string
  readonly name: string
  readonly domain: "APPLICATION_SECURITY" | "CLOUD_SECURITY" | "THREAT_ANALYSIS" | "CRYPTOGRAPHY" | "AI_DEFENSE"
  readonly framework: FrameworkMapping
  readonly mitreTechniqueId?: string
  readonly description: string
  readonly auditRules: readonly string[]
  readonly remediationPrompt: string
}

export const CYBERSECURITY_SKILLS_CATALOG: readonly SecuritySkill[] = [
  // 1. Secret & Credential Leakage Defense
  {
    id: "sec-cred-access-mitre-t1552",
    name: "Unsecured Credentials & Secret Detection",
    domain: "APPLICATION_SECURITY",
    framework: "MITRE_ATTACK",
    mitreTechniqueId: "T1552",
    description: "Detects exposed API keys, private certificates, JWT secrets, and hardcoded tokens in codebase and configs.",
    auditRules: [
      "Scan for high-entropy strings and known vendor prefixes (ghp_, sk-ant-, AKIA)",
      "Flag plaintext passwords in .env, yaml, and docker files",
      "Inspect git commit history for accidental credential commits",
    ],
    remediationPrompt: "Migrate secrets to environment secret managers (Vault / Cloudflare Secrets) and immediately rotate exposed credentials.",
  },

  // 2. Injection Attack Defense (SQLi / Command Injection)
  {
    id: "sec-injection-owasp-a03",
    name: "Injection Flaw Prevention (SQLi & Command Injection)",
    domain: "APPLICATION_SECURITY",
    framework: "OWASP_TOP_10",
    mitreTechniqueId: "T1059",
    description: "Detects dynamic string concatenation in raw SQL queries and unsanitized exec / spawn subprocess commands.",
    auditRules: [
      "Flag raw string interpolation in db.query or cursor.execute",
      "Verify parameterized queries or prepared statements are enforced",
      "Ensure child_process.exec receives validated parameter arrays rather than raw shell strings",
    ],
    remediationPrompt: "Replace raw string concatenation with parameterized SQL queries or ORM models.",
  },

  // 3. AI Agent Prompt Injection & Jailbreak Guard
  {
    id: "sec-ai-prompt-injection-atlas-aml-t0051",
    name: "LLM Prompt Injection & System Jailbreak Defense",
    domain: "AI_DEFENSE",
    framework: "NIST_AI_RMF",
    mitreTechniqueId: "AML.T0051",
    description: "Guards autonomous agents against indirect prompt injection and malicious instructions embedded in untrusted external data.",
    auditRules: [
      "Enforce strict delimiter isolation between developer system prompts and untrusted user inputs",
      "Sanitize web scraping outputs and document text before ingestion into LLM context",
      "Reject system prompt override instructions ('ignore previous instructions')",
    ],
    remediationPrompt: "Wrap untrusted context in strict XML isolation tags and enforce secondary verification before tool invocation.",
  },

  // 4. Insecure Direct Object References (IDOR) & AuthZ
  {
    id: "sec-authz-owasp-a01",
    name: "Broken Access Control & IDOR Guard",
    domain: "APPLICATION_SECURITY",
    framework: "OWASP_TOP_10",
    mitreTechniqueId: "T1078",
    description: "Detects missing authorization checks where endpoints fetch resources by user-controlled IDs without tenant ownership validation.",
    auditRules: [
      "Ensure database queries for tenant resources filter by authenticated user ID / organization ID",
      "Verify middleware checks role-based access control (RBAC) on mutating endpoints",
    ],
    remediationPrompt: "Enforce multi-tenant where clause (WHERE id = :id AND org_id = :current_user_org).",
  },
] as const

export class CybersecuritySkillsEngine {
  public static getCatalog(): readonly SecuritySkill[] {
    return CYBERSECURITY_SKILLS_CATALOG
  }

  public static getByDomain(domain: SecuritySkill["domain"]): SecuritySkill[] {
    return CYBERSECURITY_SKILLS_CATALOG.filter((s) => s.domain === domain)
  }

  public static evaluateCodeSecurity(code: string): {
    findings: { skill: SecuritySkill; matchedRule: string }[]
    isSecure: boolean
  } {
    const findings: { skill: SecuritySkill; matchedRule: string }[] = []

    // 1. Credential check
    if (/sk-[a-zA-Z0-9-_]{20,}|AKIA[0-9A-Z]{16}/.test(code)) {
      const skill = CYBERSECURITY_SKILLS_CATALOG.find((s) => s.id === "sec-cred-access-mitre-t1552")!
      findings.push({ skill, matchedRule: "Hardcoded API secret pattern detected in source" })
    }

    // 2. Raw SQL interpolation check
    if (/(SELECT|INSERT|UPDATE|DELETE)\s+.*?\$\{.*?\}/i.test(code) || /db\.query\(`.*?SELECT/i.test(code)) {
      const skill = CYBERSECURITY_SKILLS_CATALOG.find((s) => s.id === "sec-injection-owasp-a03")!
      findings.push({ skill, matchedRule: "Unsanitized template string in raw SQL query" })
    }

    // 3. Prompt injection pattern
    if (/ignore\s+(all\s+)?previous\s+instructions/i.test(code)) {
      const skill = CYBERSECURITY_SKILLS_CATALOG.find((s) => s.id === "sec-ai-prompt-injection-atlas-aml-t0051")!
      findings.push({ skill, matchedRule: "Potential prompt injection jailbreak sequence detected" })
    }

    return {
      findings,
      isSecure: findings.length === 0,
    }
  }
}
