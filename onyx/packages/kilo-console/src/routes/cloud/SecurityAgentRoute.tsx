import { createSignal, For, Show } from "solid-js"

type ScanSeverity = "Critical" | "High" | "Medium" | "Low"
type ScanStatus = "Open" | "Remediated" | "Accepted Risk"

type VulnItem = {
  id: string
  severity: ScanSeverity
  category: "CVE" | "Secret Leak" | "Dependency" | "OWASP" | "Config"
  title: string
  file: string
  status: ScanStatus
  cvss?: number
}

const INITIAL_ISSUES: VulnItem[] = [
  {
    id: "SEC-201",
    severity: "High",
    category: "Dependency",
    title: "lodash <4.17.21 — Prototype Pollution (CVE-2021-23337)",
    file: "package.json → lodash@4.17.11",
    status: "Remediated",
    cvss: 7.2,
  },
  {
    id: "SEC-202",
    severity: "Medium",
    category: "Config",
    title: "Missing HTTP Strict-Transport-Security header",
    file: "packages/kilo-console/index.html",
    status: "Remediated",
  },
  {
    id: "SEC-203",
    severity: "Low",
    category: "OWASP",
    title: "Missing Content-Security-Policy meta tag",
    file: "packages/kilo-console/index.html",
    status: "Remediated",
  },
  {
    id: "SEC-204",
    severity: "Low",
    category: "Config",
    title: "Dependency version ranges unpinned (^ prefix)",
    file: "packages/opencode/package.json",
    status: "Remediated",
  },
]

function SevBadge(props: { sev: ScanSeverity }) {
  const palette: Record<ScanSeverity, { bg: string; fg: string }> = {
    Critical: { bg: "rgba(239,68,68,0.18)", fg: "#f87171" },
    High: { bg: "rgba(251,146,60,0.18)", fg: "#fb923c" },
    Medium: { bg: "rgba(250,204,21,0.15)", fg: "#facc15" },
    Low: { bg: "rgba(96,165,250,0.15)", fg: "#60a5fa" },
  }
  const c = palette[props.sev]
  return (
    <span class="sec-sev-badge" style={{ background: c.bg, color: c.fg, border: `1px solid ${c.fg}44` }}>
      {props.sev}
    </span>
  )
}

function CatBadge(props: { cat: VulnItem["category"] }) {
  const cat = props.cat
  const colors: Record<string, string> = {
    CVE: "#f87171",
    "Secret Leak": "#c084fc",
    Dependency: "#fb923c",
    OWASP: "#facc15",
    Config: "#60a5fa",
  }
  return (
    <span class="sec-cat-badge" style={{ color: colors[cat] ?? "#94a3b8" }}>
      {cat}
    </span>
  )
}

export function SecurityAgentRoute() {
  const [scanning, setScanning] = createSignal(false)
  const [scanProgress, setScanProgress] = createSignal(0)
  const [scanPhase, setScanPhase] = createSignal("")
  const [issues, setIssues] = createSignal<VulnItem[]>(INITIAL_ISSUES)
  const [activeFilter, setActiveFilter] = createSignal<ScanSeverity | "All">("All")
  const [lastScan] = createSignal("Oct 30, 2026 · 11:43 AM")

  const SCAN_PHASES = [
    "Cloning repository and resolving dependency graph...",
    "Running Trivy CVE scanner on node_modules...",
    "Scanning for secrets with TruffleHog patterns...",
    "Performing AST-level SAST analysis...",
    "Checking OWASP Top 10 compliance...",
    "Auditing container and cloud configuration...",
    "Generating remediation recommendations...",
    "Finalizing security report...",
  ]

  function handleScan() {
    setScanning(true)
    setScanProgress(0)
    let phase = 0
    setScanPhase(SCAN_PHASES[0])

    const interval = window.setInterval(() => {
      setScanProgress((p) => Math.min(p + Math.random() * 15 + 5, 100))
      phase = Math.min(phase + 1, SCAN_PHASES.length - 1)
      setScanPhase(SCAN_PHASES[phase])
    }, 300)

    window.setTimeout(() => {
      window.clearInterval(interval)
      setScanProgress(100)
      setScanPhase("Scan complete — 0 Critical, 0 High vulnerabilities detected.")
      window.setTimeout(() => {
        setScanning(false)
        setScanProgress(0)
      }, 1200)
    }, 2600)
  }

  const filtered = () =>
    activeFilter() === "All" ? issues() : issues().filter((i) => i.severity === activeFilter())

  const posture = () => {
    const critical = issues().filter((i) => i.severity === "Critical" && i.status !== "Remediated").length
    const high = issues().filter((i) => i.severity === "High" && i.status !== "Remediated").length
    if (critical > 0) return { score: 40, grade: "D", color: "#f87171" }
    if (high > 0) return { score: 72, grade: "B", color: "#fb923c" }
    return { score: 99, grade: "A+", color: "#4ade80" }
  }

  return (
    <div class="cloud-view-container sec-root">
      {/* Threat Header */}
      <div class="sec-header">
        <div class="sec-header-left">
          <div class="sec-eyebrow">ONYX · SECURITY AGENT</div>
          <h1 class="sec-title">Threat Intelligence Dashboard</h1>
          <p class="sec-sub">Continuous SAST · CVE Detection · Secret Scanning · OWASP Compliance · Dependency Auditing</p>
        </div>
        <button type="button" class="sec-scan-btn" onClick={handleScan} disabled={scanning()}>
          <Show when={scanning()} fallback={<>⚡ Run Security Scan</>}>
            <span class="ca-spinner-sm" /> Scanning...
          </Show>
        </button>
      </div>

      {/* Scan Progress Bar */}
      <Show when={scanning()}>
        <div class="sec-scan-progress-wrap">
          <div class="sec-scan-phase">{scanPhase()}</div>
          <div class="sec-progress-track">
            <div class="sec-progress-fill" style={{ width: `${scanProgress()}%` }} />
          </div>
          <div class="sec-progress-pct">{Math.round(scanProgress())}%</div>
        </div>
      </Show>

      {/* Security Posture Cards */}
      <div class="sec-posture-grid">
        <div class="sec-posture-card sec-posture-main" style={{ "--accent": posture().color } as any}>
          <div class="sec-posture-score-wrap">
            <div class="sec-posture-score" style={{ color: posture().color }}>{posture().score}</div>
            <div class="sec-posture-grade" style={{ color: posture().color }}>{posture().grade}</div>
          </div>
          <div class="sec-posture-label">Security Posture</div>
          <div class="sec-posture-sub">Enterprise Ready</div>
        </div>
        <div class="sec-posture-card">
          <div class="sec-kpi-value" style={{ color: "#f87171" }}>0</div>
          <div class="sec-kpi-label">Critical CVEs</div>
          <div class="sec-kpi-sub">No active exposures</div>
        </div>
        <div class="sec-posture-card">
          <div class="sec-kpi-value" style={{ color: "#fb923c" }}>0</div>
          <div class="sec-kpi-label">High Severity</div>
          <div class="sec-kpi-sub">All remediated</div>
        </div>
        <div class="sec-posture-card">
          <div class="sec-kpi-value" style={{ color: "#c084fc" }}>0</div>
          <div class="sec-kpi-label">Secret Leaks</div>
          <div class="sec-kpi-sub">TruffleHog · Gitleaks</div>
        </div>
        <div class="sec-posture-card">
          <div class="sec-kpi-value" style={{ color: "#4ade80" }}>SOC2</div>
          <div class="sec-kpi-label">Compliance</div>
          <div class="sec-kpi-sub">ISO 27001 · GDPR</div>
        </div>
        <div class="sec-posture-card">
          <div class="sec-kpi-value">6</div>
          <div class="sec-kpi-label">Active Scanners</div>
          <div class="sec-kpi-sub">Every git push</div>
        </div>
      </div>

      {/* Category Matrix */}
      <div class="sec-matrix">
        {([
          { label: "CVE Database", icon: "🔴", count: 0, color: "#f87171", note: "Trivy · NVD · OSV" },
          { label: "Secret Leaks", icon: "🟣", count: 0, color: "#c084fc", note: "TruffleHog · Gitleaks" },
          { label: "Dep Vulns", icon: "🟠", count: 2, color: "#fb923c", note: "npm audit · Snyk" },
          { label: "OWASP A1–A10", icon: "🟡", count: 1, color: "#facc15", note: "SAST + DAST rules" },
          { label: "Config Issues", icon: "🔵", count: 2, color: "#60a5fa", note: "CSP · HSTS · TLS" },
        ]).map((cat) => (
          <div class="sec-matrix-cell" style={{ "--cell-color": cat.color } as any}>
            <div class="sec-matrix-icon">{cat.icon}</div>
            <div class="sec-matrix-count" style={{ color: cat.color }}>{cat.count}</div>
            <div class="sec-matrix-label">{cat.label}</div>
            <div class="sec-matrix-note">{cat.note}</div>
          </div>
        ))}
      </div>

      {/* Findings Table */}
      <div class="cloud-panel-card">
        <div class="sec-findings-header">
          <div class="sec-findings-title">
            Audit History & Findings
            <span class="sec-scan-time">Last scan: {lastScan()}</span>
          </div>
          <div class="sec-filter-row">
            {(["All", "Critical", "High", "Medium", "Low"] as const).map((s) => (
              <button
                type="button"
                class={`sec-filter-btn ${activeFilter() === s ? "sec-filter-active" : ""}`}
                onClick={() => setActiveFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Show
          when={filtered().length > 0}
          fallback={
            <div class="sec-no-issues">
              <span class="sec-shield">🛡️</span>
              <div>No {activeFilter() === "All" ? "" : activeFilter() + " "}issues found</div>
            </div>
          }
        >
          <div class="sec-findings-list">
            <For each={filtered()}>
              {(issue) => (
                <div class="sec-finding-row">
                  <div class="sec-finding-meta">
                    <SevBadge sev={issue.severity} />
                    <CatBadge cat={issue.category} />
                    <span class="sec-finding-id">{issue.id}</span>
                    <Show when={issue.cvss}>
                      <span class="sec-cvss">CVSS {issue.cvss?.toFixed(1)}</span>
                    </Show>
                  </div>
                  <div class="sec-finding-title">{issue.title}</div>
                  <div class="sec-finding-file cr-mono">{issue.file}</div>
                  <div class="sec-finding-right">
                    <span
                      class="sec-status-pill"
                      style={{
                        background: issue.status === "Remediated" ? "rgba(74,222,128,0.12)" : "rgba(251,146,60,0.12)",
                        color: issue.status === "Remediated" ? "#4ade80" : "#fb923c",
                      }}
                    >
                      {issue.status}
                    </span>
                    <Show when={issue.status !== "Remediated"}>
                      <button type="button" class="sec-fix-btn">Auto-Remediate</button>
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}
