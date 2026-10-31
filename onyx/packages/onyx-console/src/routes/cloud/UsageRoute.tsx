import { For } from "solid-js"

export function UsageRoute() {
  const modelUsage = [
    { name: "Claude 3.7 Sonnet (Reasoning & Coding)", tokens: "840K", cost: "$2.52", percent: 59, color: "#d8ff38" },
    { name: "DeepSeek V3 (Chat & Quick Edits)", tokens: "360K", cost: "$0.09", percent: 25, color: "#60a5fa" },
    { name: "Nemotron 3.5 Super VL (Multimodal)", tokens: "180K", cost: "$0.00", percent: 13, color: "#4ade80" },
    { name: "GPT-4o (Fallback & Analysis)", tokens: "40K", cost: "$0.20", percent: 3, color: "#c084fc" },
  ]

  return (
    <div class="cloud-view-container">
      <div class="cloud-page-header">
        <div>
          <h1>Usage & Inference Analytics</h1>
          <p>Real-time token metrics, agent session hours, and model consumption breakdown.</p>
        </div>
      </div>

      <div class="cloud-metric-grid">
        <div class="metric-card">
          <span class="title">Total Tokens (Billing Cycle)</span>
          <span class="value">1.42M</span>
          <span class="sub">+18% vs previous cycle</span>
        </div>
        <div class="metric-card">
          <span class="title">Remaining Credits</span>
          <span class="value" style="color:var(--cloud-volt);">$0.00</span>
          <span class="sub">Onyx Pass Starter</span>
        </div>
        <div class="metric-card">
          <span class="title">Cloud Agent Sessions</span>
          <span class="value">28</span>
          <span class="sub">100% completion rate</span>
        </div>
        <div class="metric-card">
          <span class="title">Avg Inference Latency</span>
          <span class="value">320ms</span>
          <span class="sub">Global edge acceleration</span>
        </div>
      </div>

      <div class="cloud-panel-card">
        <h3>Model Consumption Breakdown</h3>
        <p style="font-size:0.8125rem;color:var(--cloud-muted);margin:0;">
          Tokens processed by each model provider across CLI, Cloud Agent, and Code Reviewer.
        </p>

        <div style="display:flex;flex-direction:column;gap:1.25rem;margin-top:0.5rem;">
          <For each={modelUsage}>
            {(item) => (
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.8125rem;margin-bottom:0.35rem;">
                  <span style="color:#fff;font-weight:600;">{item.name}</span>
                  <span style="color:var(--cloud-muted);">
                    {item.tokens} tokens ({item.percent}%) • <strong style="color:#fff;">{item.cost}</strong>
                  </span>
                </div>
                <div style="height:8px;background:#1a1d26;border-radius:4px;overflow:hidden;">
                  <div
                    style={`height:100%;width:${item.percent}%;background:${item.color};border-radius:4px;`}
                  ></div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="cloud-panel-card">
        <h3>Inference Ledger</h3>
        <div style="font-size:0.8125rem;color:var(--cloud-muted);">
          No overage charges for the current period. All usage is covered under Free Tier and Onyx Pass allocations.
        </div>
      </div>
    </div>
  )
}
