export interface SemanticSlice {
  readonly startLine: number
  readonly endLine: number
  readonly originalSliceText: string
  readonly indentation: string
}

export interface PatchResult {
  readonly success: boolean
  readonly patchedFullText: string
  readonly linesAdded: number
  readonly linesRemoved: number
  readonly unifiedDiff: string
}

export class SemanticSlicerPatcher {
  /**
   * Locates a target block (e.g. by function header or marker) and extracts exact line coordinates.
   */
  public locateSlice(fullText: string, targetIdentifier: string): SemanticSlice | undefined {
    const lines = fullText.split("\n")
    let startIdx = -1

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(targetIdentifier)) {
        startIdx = i
        break
      }
    }

    if (startIdx === -1) return undefined

    // Detect indentation
    const indentMatch = lines[startIdx].match(/^(\s*)/)
    const indentation = indentMatch ? indentMatch[1] : ""

    // Find block termination (e.g. matching closing brace or end of block)
    let endIdx = startIdx
    let braceBalance = 0
    let foundFirstBrace = false

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i]
      for (const char of line) {
        if (char === "{") {
          braceBalance++
          foundFirstBrace = true
        } else if (char === "}") {
          braceBalance--
        }
      }

      if (foundFirstBrace && braceBalance <= 0) {
        endIdx = i
        break
      }
      // Fallback if no braces: single line or 3 lines
      if (!foundFirstBrace && i >= startIdx + 2) {
        endIdx = i
        break
      }
    }

    const sliceLines = lines.slice(startIdx, endIdx + 1)

    return {
      startLine: startIdx + 1,
      endLine: endIdx + 1,
      originalSliceText: sliceLines.join("\n"),
      indentation,
    }
  }

  /**
   * Applies surgical patch to the slice without rewriting the surrounding file.
   */
  public applySurgicalPatch(
    fullText: string,
    slice: SemanticSlice,
    newReplacementSlice: string
  ): PatchResult {
    const lines = fullText.split("\n")
    const beforeLines = lines.slice(0, slice.startLine - 1)
    const afterLines = lines.slice(slice.endLine)

    const replacementLines = newReplacementSlice.split("\n")
    const originalSliceLines = slice.originalSliceText.split("\n")

    const patchedFullText = [...beforeLines, ...replacementLines, ...afterLines].join("\n")

    const linesRemoved = originalSliceLines.length
    const linesAdded = replacementLines.length

    // Synthesize clean unified diff header
    const unifiedDiff = [
      `@@ -${slice.startLine},${linesRemoved} +${slice.startLine},${linesAdded} @@`,
      ...originalSliceLines.map((l) => `-${l}`),
      ...replacementLines.map((l) => `+${l}`),
    ].join("\n")

    return {
      success: true,
      patchedFullText,
      linesAdded,
      linesRemoved,
      unifiedDiff,
    }
  }
}
