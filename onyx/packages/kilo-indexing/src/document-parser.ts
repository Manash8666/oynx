import { analyzeLegalCompliance, type LegalRiskAssessment } from "./legal-clause-analyzer"

export interface ChunkOptions {
  readonly chunkSize?: number
  readonly chunkOverlap?: number
  readonly language?: string
}

export interface DocumentNodeMetadata {
  readonly startLine: number
  readonly endLine: number
  readonly chunkIndex: number
  readonly tokenEstimate: number
  readonly language?: string
}

export interface DocumentNode {
  readonly id: string
  readonly content: string
  readonly metadata: DocumentNodeMetadata
}

export const parseDocumentNodes = (content: string, options: ChunkOptions = {}): DocumentNode[] => {
  const chunkSize = options.chunkSize ?? 500
  const language = options.language ?? "plaintext"
  const lines = content.split("\n")

  const nodes: DocumentNode[] = []
  let currentLines: string[] = []
  let currentLength = 0
  let chunkIndex = 0
  let startLine = 1

  const flush = (endLine: number) => {
    if (currentLines.length === 0) return
    const chunkText = currentLines.join("\n").trim()
    if (chunkText.length > 0) {
      nodes.push({
        id: `node-${chunkIndex}`,
        content: chunkText,
        metadata: {
          startLine,
          endLine,
          chunkIndex,
          tokenEstimate: Math.ceil(chunkText.length / 4),
          language,
        },
      })
      chunkIndex++
    }
    currentLines = []
    currentLength = 0
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    // If starting a new chunk, record startLine
    if (currentLines.length === 0) {
      startLine = lineNumber
    }

    // Split on double newlines / paragraph boundaries or large chunk sizes
    const isParagraphBreak = line.trim() === "" && currentLength >= chunkSize / 2
    const exceedsChunkSize = currentLength + line.length > chunkSize

    if ((isParagraphBreak || exceedsChunkSize) && currentLines.length > 0) {
      flush(lineNumber - 1)
      startLine = lineNumber
    }

    currentLines.push(line)
    currentLength += line.length + 1
  }

  if (currentLines.length > 0) {
    flush(lines.length)
  }

  return nodes
}

export { analyzeLegalCompliance, type LegalRiskAssessment }

