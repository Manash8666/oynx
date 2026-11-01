import { createSignal, For, Show } from "solid-js"

type Severity = "Critical" | "High" | "Medium" | "Info"
type Finding = {
  id: string
  severity: Severity
  file: string
  line: string
  title: string
  detail: string
  category: string
}

const SAMPLE_FINDINGS: Finding[] = [
  {
    id: "CR-001",
    severity: "Critical",
    file: "src/auth/jwt.ts",
    line: "L47",
    title: "Hardcoded JWT secret in source",
    detail: "JWT_SECRET is defined inline as a string literal. Must be loaded from environment variable.",
    category: "Security",
  },
  {
    id: "CR-002",
    severity: "High",
    file: "src/api/users.ts",
    line: "L112",
    title: "SQL query built via string interpolation",
    detail: "Use parameterized queries or an ORM. Raw string concatenation creates SQL injection surface.",
    category: "Security",
  },
  {
    id: "CR-003",
    severity: "Medium",
    file: "src/components/Dashboard.tsx",
    line: "L28–34",
    title: "Unmemoized expensive computation in render",
    detail: "Heavy filter/map chain runs on every render. Wrap with useMemo or createMemo.",
    category: "Performance",
  },
  {
    id: "CR-004",
    severity: "Medium",
    file: "src/utils/api.ts",
    line: "L77",
    title: "TypeScript 'any' escape hatch",
    detail: "Parameter typed as 'any' bypasses type checking. Use unknown and narrow the type.",
    category: "Type Safety",
  },
  {
    id: "CR-005",
    severity: "Info",
    file: "src/hooks/useEvents.ts",
    line: "L55",
    title: "Event listener not cleaned up on unmount",
    detail: "addEventListener without corresponding removeEventListener causes memory leak in SPA routing.",
    category: "Memory",
  },
]

function SeverityBadge(props: { severity: Severity }) {
  const colors: Record<Severity, { bg: string; color: string }> = {
    Critical: { bg: "rgba(239,68,68,0.15)", color: "#f87171" },
    High: { bg: "rgba(251,146,60,0.15)", color: "#fb923c" },
    Medium: { bg: "rgba(250,204,21,0.15)", color: "#facc15" },
    Info: { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
  }
  const c = colors[props.severity]
  return (
    <span class="cr-badge" style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}44` }}>
      {props.severity}
    </span>
  )
}

export function CodeReviewerRoute() {
  const [prUrl, setPrUrl] = createSignal("")
  const [lang, setLang] = createSignal("auto")
  const [depth, setDepth] = createSignal<"quick" | "standard" | "deep">("standard")
  const [reviewing, setReviewing] = createSignal(false)
  const [findings, setFindings] = createSignal<Finding[]>([])
  const [filter, setFilter] = createSignal<Severity | "All">("All")

  function handleReview(e: Event) {
    e.preventDefault()
    setReviewing(true)
    window.setTimeout(() => {
      setFindings(SAMPLE_FINDINGS)
      setReviewing(false)
    }, 2200)
  }

  const filteredFindings = () =>
    filter() === "All" ? findings() : findings().filter((f) => f.severity === filter())

  const counts = () => ({
    Critical: findings().filter((f) => f.severity === "Critical").length,
    High: findings().filter((f) => f.severity === "High").length,
    Medium: findings().filter((f) => f.severity === "Medium").length,
    Info: findings().filter((f) => f.severity === "Info").length,
  })

  return (
    <div class="cloud-view-container cr-root">
      {/* Header */}
      <div class="cr-header">
        <div class="cr-header-left">
          <div class="cr-eyebrow">ONYX · LUCIFER AST CODE GUARDIAN</div>
          <h1 class="cr-title">Deterministic AST Code Reviewer</h1>
          <p class="cr-sub">DeepSeek R1 reasoning + multi-language AST pipeline. Thread-safety · Null-safety · SQLi · Secret leaks</p>
        </div>
        <div class="cr-header-stats">
          <div class="cr-stat">
            <span class="cr-stat-value">142</span>
            <span class="cr-stat-label">PRs Reviewed</span>
          </div>
          <div class="cr-stat">
            <span class="cr-stat-value" style={{ color: "#f87171" }}>7</span>
            <span class="cr-stat-label">Vulns Caught</span>
          </div>
          <div class="cr-stat">
            <span class="cr-stat-value" style={{ color: "var(--cloud-volt)" }}>22m</span>
            <span class="cr-stat-label">Avg Saved/PR</span>
          </div>
        </div>
      </div>

      <div class="cr-layout">
        {/* Left: Input Panel */}
        <div class="cr-input-panel">
          <div class="cr-panel-title">Review Target</div>
          <form onSubmit={handleReview} class="cr-form">
            <div class="cr-field">
              <label class="cr-label">Pull Request / Diff URL</label>
              <input
                type="url"
                class="cr-input"
                value={prUrl()}
                onInput={(e) => setPrUrl(e.currentTarget.value)}
                placeholder="https://github.com/owner/repo/pull/123"
              />
            </div>

            <div class="cr-field">
              <label class="cr-label">Language / Framework</label>
              <select class="cr-select" value={lang()} onChange={(e) => setLang(e.currentTarget.value)}>
                <option value="auto">Auto-Detect</option>
                <option value="typescript">TypeScript / React</option>
                <option value="python">Python / FastAPI</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="java">Java / Spring</option>
              </select>
            </div>

            <div class="cr-field">
              <label class="cr-label">Review Depth</label>
              <div class="cr-depth-tabs">
                {(["quick", "standard", "deep"] as const).map((d) => (
                  <button
                    type="button"
                    class={`cr-depth-tab ${depth() === d ? "cr-depth-active" : ""}`}
                    onClick={() => setDepth(d)}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
              <p class="cr-depth-hint">
                {depth() === "quick" && "Fast scan: security & critical issues only (~15s)"}
                {depth() === "standard" && "Balanced: security + performance + types (~45s)"}
                {depth() === "deep" && "Exhaustive: full AST + architecture review (~2m)"}
              </p>
            </div>

            <button type="submit" class="cr-review-btn" disabled={reviewing()}>
              <Show when={reviewing()} fallback={<>▶ Run Code Review</>}>
                <span class="ca-spinner-sm" /> Analyzing diff...
              </Show>
            </button>
          </form>

          {/* Category Legend */}
          <div class="cr-legend">
            <div class="cr-legend-title">Review Checks Active</div>
            {["Security & OWASP", "Type Integrity", "Performance & Memory", "Architecture Boundaries", "Test Coverage Gate"].map((item) => (
              <div class="cr-legend-item">
                <span class="cr-legend-dot" style={{ background: "#4ade80" }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Results Panel */}
        <div class="cr-results-panel">
          <Show when={findings().length === 0 && !reviewing()}>
            <div class="cr-empty">
              <div class="cr-empty-icon">⟨/⟩</div>
              <div class="cr-empty-title">Awaiting Review</div>
              <div class="cr-empty-sub">Enter a PR URL and run the review engine to see findings here.</div>
            </div>
          </Show>

          <Show when={reviewing()}>
            <div class="cr-empty">
              <div class="ca-spinner-lg" />
              <div class="cr-empty-title">Analyzing Diff...</div>
              <div class="cr-empty-sub">Parsing AST · Checking security patterns · Evaluating architecture</div>
            </div>
          </Show>

          <Show when={findings().length > 0 && !reviewing()}>
            {/* Severity Summary */}
            <div class="cr-severity-bar">
              {(["All", "Critical", "High", "Medium", "Info"] as const).map((s) => (
                <button
                  type="button"
                  class={`cr-filter-btn ${filter() === s ? "cr-filter-active" : ""}`}
                  onClick={() => setFilter(s)}
                  style={s !== "All" ? { "--filter-color": s === "Critical" ? "#f87171" : s === "High" ? "#fb923c" : s === "Medium" ? "#facc15" : "#60a5fa" } as any : {}}
                >
                  {s}
                  {s !== "All" && <span class="cr-filter-count">{counts()[s]}</span>}
                </button>
              ))}
              <div class="cr-filter-spacer" />
              <span class="cr-total-label">{filteredFindings().length} findings</span>
            </div>

            {/* Findings Feed */}
            <div class="cr-findings-list">
              <For each={filteredFindings()}>
                {(f) => (
                  <div class="cr-finding-card">
                    <div class="cr-finding-top">
                      <SeverityBadge severity={f.severity} />
                      <span class="cr-finding-cat">{f.category}</span>
                      <span class="cr-finding-id">{f.id}</span>
                    </div>
                    <div class="cr-finding-title">{f.title}</div>
                    <div class="cr-finding-location">
                      <span class="cr-file-icon">📄</span>
                      <span class="cr-mono">{f.file}</span>
                      <span class="cr-line-ref">{f.line}</span>
                    </div>
                    <div class="cr-finding-detail">{f.detail}</div>
                    <div class="cr-finding-actions">
                      <button type="button" class="cr-action-btn">View in Diff</button>
                      <button type="button" class="cr-action-btn">Auto-Fix with AI</button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}
