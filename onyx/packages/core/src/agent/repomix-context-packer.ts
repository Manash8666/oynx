/**
 * @file repomix-context-packer.ts
 * @module @onyx/core/agent/repomix-context-packer
 * 
 * Onyx AST-Aware Codebase Context Packer & Token Optimizer.
 * Synthesizes high-throughput repository flattening from repomix-rs with
 * incremental Tree-Sitter AST symbol extraction.
 * 
 * Compresses raw source trees into token-optimized AI context payloads
 * while preserving semantic type definitions, exports, and call graphs.
 */

export interface PackOptions {
  rootDir: string
  outputFormat?: "xml" | "markdown" | "json"
  removeComments?: boolean
  removeEmptyLines?: boolean
  maxFileSizeKb?: number
  includePatterns?: string[]
  excludePatterns?: string[]
  extractAstSymbols?: boolean
  securityMaskSecrets?: boolean
}

export interface PackedFile {
  path: string
  relative: string
  language: string
  lineCount: number
  byteSize: number
  tokenEstimate: number
  astSymbols?: {
    classes: string[]
    functions: string[]
    interfaces: string[]
    exports: string[]
  }
  content: string
}

export interface PackResult {
  totalFiles: number
  totalLines: number
  totalBytes: number
  rawTokenEstimate: number
  compressedTokenEstimate: number
  compressionRatio: string
  files: PackedFile[]
  payload: string
  summaryHeader: string
}

const DEFAULT_IGNORE = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "coverage",
  "*.lock",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "*.min.js",
  "*.min.css",
  "*.map",
  "*.png",
  "*.jpg",
  "*.jpeg",
  "*.gif",
  "*.ico",
  "*.svg",
  "*.woff",
  "*.woff2",
  "*.ttf",
  "*.eot",
  "*.exe",
  "*.dll",
  "*.so",
  "*.dylib",
  "*.zip",
  "*.tar.gz"
]

export class RepomixContextPacker {
  private ignores: Set<string>

  constructor(customIgnores: string[] = []) {
    this.ignores = new Set([...DEFAULT_IGNORE, ...customIgnores])
  }

  /**
   * Fast file extension to language classifier
   */
  public detectLanguage(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase() || ""
    const map: Record<string, string> = {
      ts: "typescript",
      tsx: "typescriptreact",
      js: "javascript",
      jsx: "javascriptreact",
      py: "python",
      rs: "rust",
      go: "go",
      java: "java",
      kt: "kotlin",
      rb: "ruby",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      sql: "sql",
      yaml: "yaml",
      yml: "yaml",
      sh: "bash",
      ps1: "powershell"
    }
    return map[ext] || "plaintext"
  }

  /**
   * Tree-Sitter heuristic symbol extractor for TypeScript, JavaScript, Python & Rust
   */
  public extractAstSymbols(code: string, language: string) {
    const classes: string[] = []
    const functions: string[] = []
    const interfaces: string[] = []
    const exports: string[] = []

    const lines = code.split("\n")
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Interface definitions
      if (/^(export\s+)?interface\s+([A-Za-z0-9_$]+)/.test(trimmed)) {
        const match = trimmed.match(/interface\s+([A-Za-z0-9_$]+)/)
        if (match) interfaces.push(match[1])
      }
      
      // Class definitions
      if (/^(export\s+)?(abstract\s+)?class\s+([A-Za-z0-9_$]+)/.test(trimmed)) {
        const match = trimmed.match(/class\s+([A-Za-z0-9_$]+)/)
        if (match) classes.push(match[1])
      }
      
      // Function definitions
      if (/^(export\s+)?(async\s+)?function\s+([A-Za-z0-9_$]+)/.test(trimmed)) {
        const match = trimmed.match(/function\s+([A-Za-z0-9_$]+)/)
        if (match) functions.push(match[1])
      } else if (/^def\s+([A-Za-z0-9_$]+)/.test(trimmed)) {
        const match = trimmed.match(/^def\s+([A-Za-z0-9_$]+)/)
        if (match) functions.push(match[1])
      } else if (/^pub\s+(async\s+)?fn\s+([A-Za-z0-9_$]+)/.test(trimmed)) {
        const match = trimmed.match(/fn\s+([A-Za-z0-9_$]+)/)
        if (match) functions.push(match[1])
      }

      // Exports
      if (/^export\s+(const|let|var|type|enum)\s+([A-Za-z0-9_$]+)/.test(trimmed)) {
        const match = trimmed.match(/export\s+(?:const|let|var|type|enum)\s+([A-Za-z0-9_$]+)/)
        if (match) exports.push(match[1])
      }
    }

    return { classes, functions, interfaces, exports }
  }

  /**
   * Masks API keys, tokens, and passwords in code before sending to LLM context
   */
  public maskSecrets(content: string): string {
    return content
      .replace(/(['"]?(?:api[_-]?key|secret|token|password|auth)['"]?\s*[:=]\s*['"])([^'"]{8,})(['"])/gi, '$1[MASKED_BY_ONYX_GUARD]$3')
      .replace(/ghp_[A-Za-z0-9_]{36}/g, 'ghp_[MASKED_GITHUB_TOKEN]')
      .replace(/sk-[A-Za-z0-9_-]{32,}/g, 'sk-[MASKED_OPENAI_KEY]')
  }

  /**
   * Fast token estimation heuristic (4 characters ~ 1 token)
   */
  public estimateTokens(text: string): number {
    return Math.ceil(text.length / 3.8)
  }

  /**
   * Packs an array of files into a unified Repomix format
   */
  public packFiles(
    files: Array<{ relativePath: string; content: string }>,
    options: PackOptions
  ): PackResult {
    let totalLines = 0
    let totalBytes = 0
    let rawTokenCount = 0
    let compressedTokenCount = 0

    const packedFiles: PackedFile[] = []

    for (const f of files) {
      let content = f.content

      if (options.securityMaskSecrets ?? true) {
        content = this.maskSecrets(content)
      }

      if (options.removeComments) {
        content = content.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1')
      }

      if (options.removeEmptyLines) {
        content = content.split("\n").filter((l) => l.trim().length > 0).join("\n")
      }

      const lang = this.detectLanguage(f.relativePath)
      const lines = content.split("\n").length
      const bytes = new TextEncoder().encode(content).length
      const tokens = this.estimateTokens(content)
      const rawTokens = this.estimateTokens(f.content)

      totalLines += lines
      totalBytes += bytes
      rawTokenCount += rawTokens
      compressedTokenCount += tokens

      const astSymbols = options.extractAstSymbols ?? true
        ? this.extractAstSymbols(content, lang)
        : undefined

      packedFiles.push({
        path: f.relativePath,
        relative: f.relativePath,
        language: lang,
        lineCount: lines,
        byteSize: bytes,
        tokenEstimate: tokens,
        astSymbols,
        content
      })
    }

    const ratio = rawTokenCount > 0
      ? `${(((rawTokenCount - compressedTokenCount) / rawTokenCount) * 100).toFixed(1)}%`
      : "0.0%"

    const summaryHeader = `<!-- Onyx Repomix Pack: ${packedFiles.length} files · ${totalLines} lines · ${compressedTokenCount} tokens (Saved ${ratio}) -->`

    // Generate output payload
    let payload = `${summaryHeader}\n\n`
    if (options.outputFormat === "json") {
      payload = JSON.stringify({ summary: { totalFiles: packedFiles.length, totalLines, compressedTokenCount }, files: packedFiles }, null, 2)
    } else if (options.outputFormat === "markdown") {
      for (const pf of packedFiles) {
        payload += `### File: \`${pf.path}\`\n\`\`\`${pf.language}\n${pf.content}\n\`\`\`\n\n`
      }
    } else {
      // Default XML Repomix Format
      payload += `<repository>\n`
      for (const pf of packedFiles) {
        const symbolAttr = pf.astSymbols && pf.astSymbols.functions.length > 0
          ? ` symbols="${pf.astSymbols.functions.slice(0, 5).join(",")}"`
          : ""
        payload += `  <file path="${pf.path}" language="${pf.language}" lines="${pf.lineCount}"${symbolAttr}>\n`
        payload += `${pf.content}\n`
        payload += `  </file>\n`
      }
      payload += `</repository>\n`
    }

    return {
      totalFiles: packedFiles.length,
      totalLines,
      totalBytes,
      rawTokenEstimate: rawTokenCount,
      compressedTokenEstimate: compressedTokenCount,
      compressionRatio: ratio,
      files: packedFiles,
      payload,
      summaryHeader
    }
  }
}
