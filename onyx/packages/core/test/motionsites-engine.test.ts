import { describe, it, expect } from "bun:test"
import {
  generateMotionSitePrompt,
  getMotionSiteCategories,
  getMotionSiteTemplates,
  getMotionSiteTemplate,
  ONYX_MOTION_TEMPLATES,
  getOnyxMotionTemplate,
  getOnyxMotionTemplatesByCategory,
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

  it("should load all 70 Onyx Motion Studio templates with shader paths", () => {
    expect(ONYX_MOTION_TEMPLATES.length).toBe(70)
    const vermilion = getOnyxMotionTemplate("vermilion")
    expect(vermilion).toBeDefined()
    expect(vermilion?.name).toBe("Vermilion")
    expect(vermilion?.shaderScriptPath).toBe("/templates/vermilion/bg.js")

    const mercury = getOnyxMotionTemplate("mercury")
    expect(mercury).toBeDefined()
    expect(mercury?.category).toBe("shaders-3d")

    const shaders = getOnyxMotionTemplatesByCategory("shaders-3d")
    expect(shaders.length).toBeGreaterThan(0)
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

  it("should compile motion shader prompt when an Onyx Motion template is selected", () => {
    const prompt = generateMotionSitePrompt({
      category: "shaders-3d",
      productName: "Quantum Cloud",
      description: "Distributed GPU mesh for AI workloads",
      templateId: "mercury",
    })

    expect(prompt).toContain("Mercury")
    expect(prompt).toContain("/templates/mercury/bg.js")
    expect(prompt).toContain("<canvas data-bg")
    expect(prompt).toContain("Quantum Cloud")
  })
})

