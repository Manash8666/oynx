import fs from "fs"
import path from "path"

const ROOT = process.cwd()

// File extensions to process
const VALID_EXTS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".md", ".mdx", ".html", ".css", ".yaml", ".yml",
  ".txt", ".sh", ".ps1", ".toml", ".sql"
])

const EXCLUDE_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  ".vercel",
  ".artifacts",
  "target",
  "build",
  "coverage",
  ".bun"
])

// Replacements: Order matters (longer/specific first)
const REPLACEMENTS: [RegExp, string][] = [
  // Git repositories & GitHub URLs
  [/https:\/\/github\.com\/Kilo-Org\/kilocode(?:\.git)?/gi, "https://github.com/Manash8666/oynx.git"],
  [/https:\/\/github\.com\/kilo-org\/kilocode(?:\.git)?/gi, "https://github.com/Manash8666/oynx.git"],
  [/github\.com\/Kilo-Org\/kilocode/gi, "github.com/Manash8666/oynx"],
  [/github\.com\/kilo-org\/kilocode/gi, "github.com/Manash8666/oynx"],
  [/https:\/\/github\.com\/diiviikk5\/Hacktemplates(?:\.git)?/gi, "https://github.com/Manash8666/oynx.git"],
  [/github\.com\/diiviikk5\/Hacktemplates/gi, "github.com/Manash8666/oynx"],
  [/\bKilo-Org\/kilocode\b/g, "Manash8666/oynx"],
  [/\bkilo-org\/kilocode\b/g, "Manash8666/oynx"],
  [/\bghcr\.io\/kilo-org\b/g, "ghcr.io/manash8666"],

  // Domains & Web URLs
  [/https:\/\/app\.kilo\.ai/gi, "https://app.oynx.si"],
  [/http:\/\/app\.kilo\.ai/gi, "https://app.oynx.si"],
  [/app\.kilo\.ai/gi, "app.oynx.si"],
  [/https:\/\/kilo\.ai/gi, "https://oynx.si"],
  [/http:\/\/kilo\.ai/gi, "https://oynx.si"],
  [/https:\/\/docs\.kilo\.ai/gi, "https://oynx.si/docs"],
  [/docs\.kilo\.ai/gi, "oynx.si/docs"],
  [/\bkilo\.ai\b/gi, "oynx.si"],

  // User-facing branding (Title & Text)
  [/\bKilo Code\b/g, "Onyx"],
  [/\bKilo Pass\b/g, "Onyx Pass"],
  [/\bKilo IDE\b/g, "Onyx IDE"],
  [/\bKilo CLI\b/g, "Onyx CLI"],
  [/\bKilo Console\b/g, "Onyx Console"],
  [/\bKilo Cloud\b/g, "Onyx Cloud"],
  [/\bKilo App\b/g, "Onyx App"],
  [/\bKilo Profile\b/g, "Onyx Profile"],
  [/\bKilo Account\b/g, "Onyx Account"],
  [/\bKilo Organizations\b/g, "Onyx Organizations"],
  [/\bKilo Sessions\b/g, "Onyx Sessions"],
  [/\bKilo Webhooks\b/g, "Onyx Webhooks"],
  [/\bKilo Agent\b/g, "Onyx Agent"],
  [/\bKiloBench\b/g, "OnyxBench"],

  // Code comments & markers
  [/\/\/ kilocode_change/g, "// onyx_change"],
  [/<!-- kilocode_change -->/g, "<!-- onyx_change -->"],
  [/\/\* kilocode_change/g, "/* onyx_change"],
  [/\bkilocode_change\b/g, "onyx_change"]
]

let filesModified = 0
let totalReplacements = 0

function walk(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (!VALID_EXTS.has(ext)) continue

      try {
        let content = fs.readFileSync(fullPath, "utf8")
        let modified = false
        let fileCount = 0

        for (const [pattern, replacement] of REPLACEMENTS) {
          const matches = content.match(pattern)
          if (matches) {
            content = content.replace(pattern, replacement)
            modified = true
            fileCount += matches.length
            totalReplacements += matches.length
          }
        }

        if (modified) {
          fs.writeFileSync(fullPath, content, "utf8")
          filesModified++
          console.log(`[Replaced ${fileCount}] ${path.relative(ROOT, fullPath)}`)
        }
      } catch (err) {
        // Skip binary or unreadable files
      }
    }
  }
}

console.log("Starting deep purge of kilo & external git references across website and onyx...")
walk(path.join(ROOT, "website"))
walk(path.join(ROOT, "onyx"))

console.log(`\nPurge complete!`)
console.log(`Total files modified: ${filesModified}`)
console.log(`Total replacements made: ${totalReplacements}`)
