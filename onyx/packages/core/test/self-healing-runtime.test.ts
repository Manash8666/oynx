import { describe, expect, test } from "bun:test"
import { SelfHealingRuntimeEngine } from "../src/runtime/self-healing-runtime"

describe("Self-Healing Runtime Execution Loop (Upgrade 7)", () => {
  const engine = new SelfHealingRuntimeEngine()

  test("should pass valid code on first attempt without needing heal cycles", () => {
    const validCode = `const greeting = "Hello Onyx"; console.log(greeting);`
    const report = engine.healCode(validCode)
    expect(report.isGreen).toBe(true)
    expect(report.totalAttempts).toBe(0)
  })

  test("should intercept ReferenceError and automatically heal undefined variables", () => {
    const brokenCode = `console.log(missingUserToken);`
    const report = engine.healCode(brokenCode)

    expect(report.isGreen).toBe(true)
    expect(report.totalAttempts).toBeGreaterThan(0)
    expect(report.finalCode).toContain("const missingUserToken")
    expect(report.history[0].diagnostic).toContain("ReferenceError")
  })

  test("should intercept SyntaxError and heal malformed assignments", () => {
    const brokenSyntax = `const = "broken";`
    const report = engine.healCode(brokenSyntax)

    expect(report.isGreen).toBe(true)
    expect(report.finalCode).toContain("const temp =")
  })
})
