import { readdirSync, readFileSync, statSync, existsSync } from "fs"
import { join } from "path"

function walk(dir: string): string[] {
  let files: string[] = []
  if (!existsSync(dir)) return files
  for (const item of readdirSync(dir)) {
    const full = join(dir, item)
    if (statSync(full).isDirectory()) {
      if (item !== "node_modules" && item !== ".git" && item !== "dist") {
        files = files.concat(walk(full))
      }
    } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      files.push(full)
    }
  }
  return files
}

console.log("=== ADVERSARIAL AUDIT SCANNER (Google Antigravity Mode) ===")

const websiteFiles = walk("website/src")
const devServerSource = readFileSync("onyx-dev-server.ts", "utf-8")

// 1. Audit HREFs
const allHrefs: Array<{ file: string; line: number; href: string }> = []
const hrefRegex = /href=["']([^"']+)["']/g

for (const file of websiteFiles) {
  const content = readFileSync(file, "utf-8")
  const lines = content.split("\n")
  for (let i = 0; i < lines.length; i++) {
    let match
    while ((match = hrefRegex.exec(lines[i])) !== null) {
      allHrefs.push({ file, line: i + 1, href: match[1] })
    }
  }
}

console.log(`\n1. Found ${allHrefs.length} hrefs across ${websiteFiles.length} files.`)
const uniqueHrefs = [...new Set(allHrefs.map((h) => h.href))]
console.log("Unique Hrefs:", uniqueHrefs)

// Check for broken internal links
const knownRoutes = [
  "/",
  "/what-is-onyx",
  "/compliance",
  "/eula",
  "/license",
  "/retina-ready",
  "/docs",
  "/code-reviewer",
  "/security-agent",
  "/leaderboard",
  "/vpc",
  "/pricing",
  "/login",
  "/dashboard",
  "/settings",
  "/colibri"
]

const brokenHrefs: typeof allHrefs = []
for (const h of allHrefs) {
  if (h.href.startsWith("http://") || h.href.startsWith("https://") || h.href.startsWith("mailto:")) {
    continue
  }
  const cleanPath = h.href.split("#")[0]
  if (cleanPath && !knownRoutes.includes(cleanPath) && !h.href.startsWith("/download/")) {
    brokenHrefs.push(h)
  }
}

if (brokenHrefs.length > 0) {
  console.log("⚠️ Potential Broken Internal Hrefs:", brokenHrefs)
} else {
  console.log("✅ All internal hrefs map to known SPA routes or downloads.")
}

// 2. Audit Downloads
console.log("\n2. Checking Downloadable Assets...")
const downloadHrefs = allHrefs.filter((h) => h.href.startsWith("/download/"))
for (const dh of downloadHrefs) {
  const localPublicPath = join("website/public", dh.href)
  const exists = existsSync(localPublicPath)
  console.log(`Download: ${dh.href} -> Exists on disk: ${exists ? "✅ YES" : "❌ NO"}`)
}

// 3. Audit Frontend fetch() calls vs Backend Endpoints
console.log("\n3. Checking Frontend fetch() endpoints against onyx-dev-server.ts...")
const fetchCalls: Array<{ file: string; url: string }> = []
const fetchRegex = /fetch\(["'`]([^"'`]+)["'`]/g

for (const file of websiteFiles) {
  const content = readFileSync(file, "utf-8")
  let match
  while ((match = fetchRegex.exec(content)) !== null) {
    fetchCalls.push({ file, url: match[1] })
  }
}

console.log("Found frontend fetch calls:", fetchCalls)
for (const fc of fetchCalls) {
  if (fc.url.startsWith("http")) continue
  const urlPath = fc.url.split("?")[0]
  const hasRouteInServer = devServerSource.includes(`"${urlPath}"`) || devServerSource.includes(`'${urlPath}'`)
  console.log(`Endpoint: ${urlPath} -> Registered in onyx-dev-server.ts: ${hasRouteInServer ? "✅ YES" : "❌ NO"}`)
}

// 4. Audit Dead Buttons / Empty Handlers
console.log("\n4. Checking for empty / placeholder onClick handlers...")
for (const file of websiteFiles) {
  const content = readFileSync(file, "utf-8")
  if (content.includes("onClick={() => {}}") || content.includes("onClick={() => alert(")) {
    console.log(`⚠️ Dead placeholder onClick in ${file}`)
  }
}
