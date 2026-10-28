import { describe, expect, test } from "bun:test"
import { PersistentProjectMemory } from "../src/agent/persistent-project-memory"

describe("Self-Learning Persistent Project Memory (Upgrade 4)", () => {
  const memory = new PersistentProjectMemory()

  test("should record decisions and anti-patterns with confidence scores", () => {
    const decision = memory.recordDecision(
      "Use SolidJS and Tailwind v4",
      "All new UI components must be created in packages/ui using SolidJS signals and Tailwind CSS v4 utility classes."
    )
    expect(decision.type).toBe("DECISION")
    expect(decision.confidence).toBe(1.0)

    const anti = memory.recordAntiPattern(
      "Direct Drive C Downloads",
      "Never download large LLM models to C:; always route to E:\\.ollama\\models to avoid disk exhaustion."
    )
    expect(anti.type).toBe("ANTI_PATTERN")
  })

  test("should retrieve relevant learned memories matching query context", () => {
    const matches = memory.queryRelevantContext("Where do we download LLM models?")
    expect(matches.length).toBeGreaterThanOrEqual(1)
    expect(matches[0].content).toContain("E:\\.ollama\\models")
  })

  test("should format learned constraints into prompt injection text", () => {
    const promptConstraint = memory.formatSystemPromptConstraints("Downloading LLM models for test")
    expect(promptConstraint).toContain("CRITICAL WARNING")
    expect(promptConstraint).toContain("Direct Drive C Downloads")
  })
})
