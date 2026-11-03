import { readFileSync } from "fs"
import { globSync } from "glob"

console.log("=== DEEP INTERACTIVE ELEMENT AUDIT ===")

const pages = [
  "website/src/pages/CodeReviewer.tsx",
  "website/src/pages/Compliance.tsx",
  "website/src/pages/DashboardPage.tsx",
  "website/src/pages/Docs.tsx",
  "website/src/pages/Eula.tsx",
  "website/src/pages/Leaderboard.tsx",
  "website/src/pages/License.tsx",
  "website/src/pages/LoginPage.tsx",
  "website/src/pages/PricingPage.tsx",
  "website/src/pages/RetinaReady.tsx",
  "website/src/pages/SecurityAgent.tsx",
  "website/src/pages/SettingsPage.tsx",
  "website/src/pages/VpcDeployment.tsx",
  "website/src/pages/WhatIsOnyx.tsx",
  "website/src/pages/ColibriPage.tsx"
]

for (const p of pages) {
  const code = readFileSync(p, "utf-8")
  const buttons = (code.match(/<button[^>]*>/g) || []).length
  const inputs = (code.match(/<input[^>]*>/g) || []).length
  const forms = (code.match(/<form[^>]*>/g) || []).length
  const links = (code.match(/<a [^>]*>/g) || []).length
  console.log(`Page: ${p.padEnd(38)} | Buttons: ${buttons} | Inputs: ${inputs} | Forms: ${forms} | Links: ${links}`)
}
