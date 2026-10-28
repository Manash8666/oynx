import { describe, it, expect } from "bun:test"
import {
  generateMotionSitePrompt,
  getMotionSiteCategories,
  getMotionSiteTemplates,
  getMotionSiteTemplate,
} from "../src/skills/motionsites-engine"

describe("MotionSites Engine & Web Generator (MIT)", () => {
  it("should list available cinematic web design categories", () => {
    const categories = getMotionSiteCategories()
    expect(categories).toContain("saas-landing")
    expect(categories).toContain("portfolio")
    expect(categories).toContain("ai-agent-showcase")
    expect(categories).toContain("security-cloud")
    expect(categories).toContain("creative-studio")
  })

  it("should list available curated templates", () => {
    const templates = getMotionSiteTemplates()
    expect(templates.length).toBeGreaterThanOrEqual(5)
    
    const apex = getMotionSiteTemplate("apex-saas")
    expect(apex).toBeDefined()
    expect(apex?.name).toBe("Apex SaaS")
    expect(apex?.colorSystem).toBeDefined()
    expect(apex?.colorSystem.background).toBeDefined()
  })

  it("should compile a structured design prompt injecting MotionSites aesthetic rules", () => {
    const prompt = generateMotionSitePrompt({
      category: "saas-landing",
      productName: "Vibe Code",
      description: "Next-gen agentic IDE with multi-model intelligence",
      templateId: "apex-saas",
    })

    expect(prompt).toContain("Tailwind CSS")
    expect(prompt).toContain("liquid-glass")
    expect(prompt).toContain("Vibe Code")
    expect(prompt).toContain("Next-gen agentic IDE")
    expect(prompt).not.toContain("proprietary")
  })
})

