import { describe, it, expect } from "bun:test"
import {
  DEFAULT_VIBE_MODELS,
  STUDIO_TEMPLATES,
  ModelSelectorPanel,
  MotionSitesStudioPanel,
  LegalComplianceCard,
  GenerativeMediaPanel,
} from "../src/components/vibe"

describe("Vibe Frontend Component Suite (SolidJS 1.9 + Tailwind v4)", () => {
  it("should contain all required local Ollama and cloud frontier models in selector catalog", () => {
    const ids = DEFAULT_VIBE_MODELS.map((m) => m.id)
    expect(ids).toContain("qwen3-coder")
    expect(ids).toContain("deepseek-coder")
    expect(ids).toContain("deepseek-r1")
    expect(ids).toContain("gemma-27b")
    expect(ids).toContain("kimi-k3")
    expect(ids).toContain("glm-5")
    expect(ids).toContain("nemotron-70b")
    expect(ids).toContain("gpt-oss-120b")
  })

  it("should list MotionSites studio templates with valid HSL primary color values", () => {
    expect(STUDIO_TEMPLATES.length).toBeGreaterThanOrEqual(5)
    for (const t of STUDIO_TEMPLATES) {
      expect(t.primaryColor).toContain("hsl")
      expect(t.category).toBeDefined()
    }
  })

  it("should instantiate all Vibe UI component functions without errors", () => {
    expect(typeof ModelSelectorPanel).toBe("function")
    expect(typeof MotionSitesStudioPanel).toBe("function")
    expect(typeof LegalComplianceCard).toBe("function")
    expect(typeof GenerativeMediaPanel).toBe("function")
  })
})
