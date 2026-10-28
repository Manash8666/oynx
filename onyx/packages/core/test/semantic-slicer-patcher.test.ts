import { describe, expect, test } from "bun:test"
import { SemanticSlicerPatcher } from "../src/diff/semantic-slicer-patcher"

describe("Pillar 5: Semantic AST Slicing & Surgical Micro-Patching (Codex & Cursor Inspired)", () => {
  const patcher = new SemanticSlicerPatcher()

  const largeSampleFile = `
// Header comments line 1
// Copyright line 2

export function calculateTax(amount: number): number {
  return amount * 0.15;
}

// Unrelated function that must NOT be touched
export function formatCurrency(val: number): string {
  return "$" + val.toFixed(2);
}
`.trim()

  test("should locate function slice with exact line bounds and detected indentation", () => {
    const slice = patcher.locateSlice(largeSampleFile, "function calculateTax")
    expect(slice).toBeDefined()
    expect(slice?.startLine).toBe(4)
    expect(slice?.endLine).toBe(6)
    expect(slice?.originalSliceText).toContain("return amount * 0.15")
  })

  test("should surgically replace slice while preserving all surrounding code and comments", () => {
    const slice = patcher.locateSlice(largeSampleFile, "function calculateTax")!

    const newSlice = `export function calculateTax(amount: number, rate = 0.20): number {\n  return amount * rate;\n}`

    const patchResult = patcher.applySurgicalPatch(largeSampleFile, slice, newSlice)

    expect(patchResult.success).toBe(true)
    expect(patchResult.patchedFullText).toContain("rate = 0.20")
    expect(patchResult.patchedFullText).toContain("// Header comments line 1")
    expect(patchResult.patchedFullText).toContain("export function formatCurrency")
    expect(patchResult.unifiedDiff).toContain("@@ -4,3 +4,3 @@")
    expect(patchResult.unifiedDiff).toContain("-  return amount * 0.15;")
    expect(patchResult.unifiedDiff).toContain("+  return amount * rate;")
  })
})
