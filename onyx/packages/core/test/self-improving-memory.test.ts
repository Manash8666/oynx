import { describe, it, expect } from "bun:test"
import { SelfImprovingMemory } from "../src/agent/self-improving-memory"
import { runReflectionLoop } from "../src/agent/reflection-loop"

describe("Self-Improving Agent Memory (Agno-Inspired, Apache 2.0)", () => {
  it("should record successful patterns and extract reusable coding insights", async () => {
    const memory = new SelfImprovingMemory({ maxLearnings: 50 })
    
    await memory.recordOutcome({
      task: "build reactive counter",
      success: true,
      strategy: "used createSignal with accessor syntax in SolidJS",
      language: "typescript",
    })

    const insights = await memory.retrieveInsights("SolidJS state management")
    expect(insights.length).toBeGreaterThan(0)
    expect(insights[0].strategy).toContain("createSignal")
    expect(insights[0].confidenceScore).toBeGreaterThanOrEqual(0.8)
  })

  it("should record failed attempts and generate anti-pattern warnings", async () => {
    const memory = new SelfImprovingMemory({ maxLearnings: 50 })
    
    await memory.recordOutcome({
      task: "install dependencies with root lockfile",
      success: false,
      strategy: "ran bun install without specifying temp cache directory on drive with low space",
      errorPattern: "ENOSPC out of disk space on drive C",
      language: "shell",
    })

    const warnings = await memory.retrieveWarnings("disk space error")
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings[0].antiPattern).toContain("ENOSPC")
    expect(warnings[0].suggestedFix).toBeDefined()
  })

  it("should run reflection loop on a multi-step agent trajectory", () => {
    const trajectory = [
      { step: 1, action: "read_file", status: "success" },
      { step: 2, action: "run_test", status: "failure", error: "type mismatch" },
      { step: 3, action: "edit_file", status: "success" },
      { step: 4, action: "run_test", status: "success" },
    ]

    const reflection = runReflectionLoop(trajectory)
    expect(reflection.totalSteps).toBe(4)
    expect(reflection.hadCorrections).toBe(true)
    expect(reflection.distilledLearnings.length).toBeGreaterThan(0)
  })
})

