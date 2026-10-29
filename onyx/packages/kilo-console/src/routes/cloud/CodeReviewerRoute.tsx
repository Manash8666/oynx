import { createSignal, For } from "solid-js"

type ReviewRule = {
  id: string
  title: string
  desc: string
  enabled: boolean
}

export function CodeReviewerRoute() {
  const [rules, setRules] = createSignal<ReviewRule[]>([
    {
      id: "r1",
      title: "Security & Secret Leakage Prevention",
      desc: "Detect hardcoded API keys, JWT tokens, unescaped SQL queries, and OWASP Top 10 risks in PR diffs.",
      enabled: true,
    },
    {
      id: "r2",
      title: "Architectural & Type Rigor",
      desc: "Flag any 'any' types in TypeScript, ensure immutability conventions, and check clean architecture boundaries.",
      enabled: true,
    },
    {
      id: "r3",
      title: "Performance & Memory Leak Auditing",
      desc: "Detect unmemoized React components, unbounded event listeners, and unindexed database queries.",
      enabled: true,
    },
    {
      id: "r4",
      title: "Automated Test Coverage Gate",
      desc: "Require unit or integration test files whenever modifying core business logic (minimum 80% diff coverage).",
      enabled: false,
    },
  ])

  function toggleRule(id: string) {
    setRules(
      rules().map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    )
  }

  return (
    <div class="cloud-view-container">
      <div class="cloud-page-header">
        <div>
          <h1>AI Code Reviewer</h1>
          <p>Automate pull request reviews with architectural linting, vulnerability detection, and automated suggestions.</p>
        </div>
      </div>

      <div class="cloud-metric-grid">
        <div class="metric-card">
          <span class="title">PRs Reviewed</span>
          <span class="value">142</span>
          <span class="sub">Past 30 days</span>
        </div>
        <div class="metric-card">
          <span class="title">Security Vulnerabilities Caught</span>
          <span class="value" style="color:var(--cloud-volt);">7</span>
          <span class="sub">Zero production leaks</span>
        </div>
        <div class="metric-card">
          <span class="title">Time Saved Per PR</span>
          <span class="value">22m</span>
          <span class="sub">Human review speedup</span>
        </div>
        <div class="metric-card">
          <span class="title">Approval Accuracy</span>
          <span class="value">99.4%</span>
          <span class="sub">Verified by senior leads</span>
        </div>
      </div>

      <div class="cloud-panel-card">
        <h3>Review Policies & Rules</h3>
        <div style="display:flex;flex-direction:column;gap:1rem;">
          <For each={rules()}>
            {(rule) => (
              <div
                style="display:flex;align-items:center;justify-content:space-between;padding:1rem;background:#171a22;border:1px solid var(--cloud-card-border);border-radius:8px;"
              >
                <div style="max-width:80%;">
                  <div style="font-weight:600;color:#fff;font-size:0.9375rem;">{rule.title}</div>
                  <div style="font-size:0.75rem;color:var(--cloud-muted);margin-top:0.25rem;line-height:1.4;">
                    {rule.desc}
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    class={rule.enabled ? "btn-primary" : "btn-secondary"}
                    style="font-size:0.75rem;padding:0.35rem 0.75rem;"
                    onClick={() => toggleRule(rule.id)}
                  >
                    {rule.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
