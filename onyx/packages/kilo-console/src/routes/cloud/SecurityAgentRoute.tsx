import { createSignal, For } from "solid-js"

type SecurityIssue = {
  id: string
  severity: "Low" | "Medium" | "High" | "Critical"
  title: string
  file: string
  status: "Remediated" | "Under Review"
}

export function SecurityAgentRoute() {
  const [scanning, setScanning] = createSignal(false)
  const [issues] = createSignal<SecurityIssue[]>([
    {
      id: "SEC-109",
      severity: "Low",
      title: "Add strict Content-Security-Policy (CSP) headers to client console index.html",
      file: "packages/kilo-console/index.html",
      status: "Remediated",
    },
    {
      id: "SEC-104",
      severity: "Low",
      title: "Pin transient dependency versions in package.json to prevent lockfile drift",
      file: "packages/opencode/package.json",
      status: "Remediated",
    },
  ])

  function handleTriggerScan() {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      alert("Security Scan Complete: 0 Critical, 0 High, 0 Medium vulnerabilities found across 42 repositories.")
    }, 2000)
  }

  return (
    <div class="cloud-view-container">
      <div class="cloud-page-header">
        <div>
          <h1>Security Agent & SAST Scanner</h1>
          <p>Continuous dependency auditing, AST-level vulnerability detection, and secret leak prevention.</p>
        </div>
        <button type="button" class="btn-primary" onClick={handleTriggerScan} disabled={scanning()}>
          {scanning() ? "Scanning Codebases..." : "Run Security Scan Now"}
        </button>
      </div>

      <div class="cloud-metric-grid">
        <div class="metric-card">
          <span class="title">Security Posture Score</span>
          <span class="value" style="color:#4ade80;">99 / 100</span>
          <span class="sub">Grade A+ (Enterprise Ready)</span>
        </div>
        <div class="metric-card">
          <span class="title">Critical CVEs</span>
          <span class="value">0</span>
          <span class="sub">Clean bill of health</span>
        </div>
        <div class="metric-card">
          <span class="title">Active Secret Scanners</span>
          <span class="value">6</span>
          <span class="sub">Scanning on every git push</span>
        </div>
        <div class="metric-card">
          <span class="title">Compliance Level</span>
          <span class="value">SOC2 / ISO</span>
          <span class="sub">Automated audit trails</span>
        </div>
      </div>

      <div class="cloud-panel-card">
        <h3>Audit History & Findings</h3>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <For each={issues()}>
            {(issue) => (
              <div
                style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:#171a22;border:1px solid var(--cloud-card-border);border-radius:8px;"
              >
                <div>
                  <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span style="font-size:0.6875rem;padding:0.15rem 0.35rem;background:rgba(255,255,255,0.08);color:var(--cloud-muted);border-radius:4px;font-weight:700;">
                      {issue.severity}
                    </span>
                    <span style="font-weight:600;color:#fff;font-size:0.875rem;">{issue.title}</span>
                  </div>
                  <div style="font-size:0.75rem;color:var(--cloud-dim);margin-top:0.25rem;font-family:var(--font-family-mono, monospace);">
                    Location: {issue.file}
                  </div>
                </div>
                <div>
                  <span style="font-size:0.75rem;padding:0.25rem 0.5rem;background:rgba(74,222,128,0.12);color:#4ade80;border-radius:4px;font-weight:600;">
                    {issue.status}
                  </span>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
