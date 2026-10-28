import { describe, expect, test } from "bun:test"
import { LspCompilerGuard } from "../src/lsp/lsp-compiler-guard"

describe("Pillar 1: Native LSP Compiler Verification Loop & Process Isolation (VS Code Inspired)", () => {
  const guard = new LspCompilerGuard()

  test("should detect TS2322 type mismatches and provide coordinate ranges", () => {
    const invalidCode = `const score: number = "100";`
    const result = guard.verifySource("src/score.ts", invalidCode)

    expect(result.isClean).toBe(false)
    expect(result.errorCount).toBe(1)
    expect(result.diagnostics[0].code).toBe("TS2322")
    expect(result.diagnostics[0].message).toContain("Type 'string' is not assignable to type 'number'")
    expect(result.autoFixSuggestion).toContain("Number()")
  })

  test("should pass valid TypeScript code with 0 compiler errors", () => {
    const validCode = `const score: number = 100;\nexport const getScore = () => score;`
    const result = guard.verifySource("src/score.ts", validCode)

    expect(result.isClean).toBe(true)
    expect(result.errorCount).toBe(0)
    expect(result.diagnostics.length).toBe(0)
  })

  test("should run heavy tasks in isolated wrapper and enforce execution timeout", async () => {
    // Normal fast task
    const fast = await guard.runIsolatedTask("fast-analysis", async () => 42, 1000)
    expect(fast.timedOut).toBe(false)
    expect(fast.result).toBe(42)

    // Long task exceeding timeout
    const slow = await guard.runIsolatedTask(
      "infinite-analysis",
      () => new Promise((resolve) => setTimeout(resolve, 500)),
      100 // 100ms timeout
    )
    expect(slow.timedOut).toBe(true)
    expect(slow.result).toBeUndefined()
  })
})
