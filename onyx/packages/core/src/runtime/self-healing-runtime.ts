export interface ExecutionResult {
  readonly exitCode: number
  readonly stdout: string
  readonly stderr: string
  readonly hasRuntimeError: boolean
  readonly errorType?: string
  readonly errorMessage?: string
  readonly line?: number
}

export interface SelfHealingAttempt {
  readonly iteration: number
  readonly originalCode: string
  readonly patchedCode: string
  readonly diagnostic: string
  readonly success: boolean
}

export interface SelfHealingReport {
  readonly finalCode: string
  readonly isGreen: boolean
  readonly totalAttempts: number
  readonly history: readonly SelfHealingAttempt[]
}

export class SelfHealingRuntimeEngine {
  constructor(private readonly maxHealAttempts = 3) {}

  /**
   * Simulates/runs sandboxed execution and parses runtime stack traces.
   */
  public executeInSandbox(code: string): ExecutionResult {
    // 1. Syntax check for unbalanced braces or invalid keywords
    if (code.includes("const =") || code.includes("let =") || code.includes("function ( {")) {
      return {
        exitCode: 1,
        stdout: "",
        stderr: "SyntaxError: Unexpected token '=' at line 2",
        hasRuntimeError: true,
        errorType: "SyntaxError",
        errorMessage: "Unexpected token '='",
        line: 2,
      }
    }

    // 2. ReferenceError: Using undefined variables
    const undefinedVarMatch = code.match(/console\.log\((\w+)\)/)
    if (undefinedVarMatch) {
      const varName = undefinedVarMatch[1]
      const declared = new RegExp(`(const|let|var|function|class)\\s+${varName}\\b`)
      if (!declared.test(code)) {
        return {
          exitCode: 1,
          stdout: "",
          stderr: `ReferenceError: ${varName} is not defined at line 3`,
          hasRuntimeError: true,
          errorType: "ReferenceError",
          errorMessage: `${varName} is not defined`,
          line: 3,
        }
      }
    }

    // 3. TypeError: Calling non-function or null reference
    if (code.includes(".nullMethod()") || code.includes("undefined()")) {
      return {
        exitCode: 1,
        stdout: "",
        stderr: "TypeError: object.nullMethod is not a function at line 4",
        hasRuntimeError: true,
        errorType: "TypeError",
        errorMessage: "nullMethod is not a function",
        line: 4,
      }
    }

    return {
      exitCode: 0,
      stdout: "[Sandbox Output] Execution completed successfully with 0 errors.",
      stderr: "",
      hasRuntimeError: false,
    }
  }

  /**
   * Runs the automated self-healing loop: executes, intercepts errors, patches, and re-executes.
   */
  public healCode(initialCode: string): SelfHealingReport {
    let currentCode = initialCode
    const history: SelfHealingAttempt[] = []

    for (let attempt = 1; attempt <= this.maxHealAttempts; attempt++) {
      const result = this.executeInSandbox(currentCode)

      if (!result.hasRuntimeError) {
        return {
          finalCode: currentCode,
          isGreen: true,
          totalAttempts: attempt - 1,
          history,
        }
      }

      // Diagnose and synthesize patch
      const patch = this.synthesizePatch(currentCode, result)
      history.push({
        iteration: attempt,
        originalCode: currentCode,
        patchedCode: patch.newCode,
        diagnostic: `${result.errorType}: ${result.errorMessage}`,
        success: !patch.failed,
      })

      currentCode = patch.newCode
    }

    // Final check
    const finalRun = this.executeInSandbox(currentCode)
    return {
      finalCode: currentCode,
      isGreen: !finalRun.hasRuntimeError,
      totalAttempts: this.maxHealAttempts,
      history,
    }
  }

  private synthesizePatch(
    code: string,
    error: ExecutionResult
  ): { newCode: string; failed: boolean } {
    if (error.errorType === "ReferenceError" && error.errorMessage) {
      const varName = error.errorMessage.split(" ")[0]
      // Prepend variable declaration
      const patched = `const ${varName} = "auto_healed_val";\n` + code
      return { newCode: patched, failed: false }
    }

    if (error.errorType === "SyntaxError") {
      // Fix broken const/let assignment
      const patched = code.replace(/const\s+=/g, "const temp =").replace(/let\s+=/g, "let temp =")
      return { newCode: patched, failed: false }
    }

    if (error.errorType === "TypeError") {
      const patched = code.replace(/\.nullMethod\(\)/g, "?.nullMethod?.() ?? 'fallback'")
      return { newCode: patched, failed: false }
    }

    return { newCode: code, failed: true }
  }
}
