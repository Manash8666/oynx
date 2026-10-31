import { createSignal, For, Show } from "solid-js"

const MODELS = [
  { value: "auto", label: "Auto — Intelligent Routing", provider: "ONYX", badge: "#d8ff38", free: false },
  { value: "claude-3-7-sonnet", label: "Claude 3.7 Sonnet", provider: "ANTHROPIC", badge: "#d97706", free: false },
  { value: "deepseek-v3", label: "DeepSeek V3", provider: "DEEPSEEK", badge: "#3b82f6", free: false },
  { value: "gemini-2-flash", label: "Gemini 2.0 Flash", provider: "GOOGLE", badge: "#4ade80", free: true },
  { value: "nemotron-3-5", label: "Nemotron 3.5 Super VL", provider: "NVIDIA", badge: "#76ff03", free: true },
]

const REGIONS = ["us-east-1", "eu-west-1", "ap-south-1", "auto"]

type TaskStatus = "idle" | "running" | "completed" | "failed"

export function CloudAgentRoute() {
  const [repo, setRepo] = createSignal("https://github.com/Manash8666/oynx.git")
  const [branch, setBranch] = createSignal("main")
  const [model, setModel] = createSignal("auto")
  const [region, setRegion] = createSignal("auto")
  const [prompt, setPrompt] = createSignal("")
  const [envVars, setEnvVars] = createSignal("")
  const [timeout, setTimeout_] = createSignal("600")
  const [showAdvanced, setShowAdvanced] = createSignal(false)
  const [status, setStatus] = createSignal<TaskStatus>("idle")
  const [logs, setLogs] = createSignal<string[]>([])
  const [taskId] = createSignal(`TASK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`)
  const [elapsed, setElapsed] = createSignal(0)

  const recentTasks = [
    { id: "TASK-A3F9B2", repo: "oynx.git", model: "claude-3-7-sonnet", status: "completed", time: "2m 38s", ago: "3h ago" },
    { id: "TASK-B7C1D4", repo: "oynx.git", model: "deepseek-v3", status: "completed", time: "1m 12s", ago: "1d ago" },
    { id: "TASK-E2A0F5", repo: "oynx.git", model: "auto", status: "failed", time: "45s", ago: "2d ago" },
  ]

  function statusColor(s: string) {
    if (s === "completed") return "#4ade80"
    if (s === "failed") return "#f87171"
    if (s === "running") return "var(--cloud-volt)"
    return "var(--cloud-muted)"
  }

  function handleStartAgent(e: Event) {
    e.preventDefault()
    if (!prompt().trim()) return
    setStatus("running")
    setElapsed(0)
    const modelLabel = MODELS.find((m) => m.value === model())?.label ?? model()
    const lines = [
      `[onyx-cloud] ◆ Task ${taskId()} dispatched to ${region() === "auto" ? "us-east-1 (auto-selected)" : region()}`,
      `[onyx-cloud] ◆ Provisioning Firecracker microVM (cold-start: 0.8s)...`,
      `[onyx-cloud] ◆ Cloning ${repo()} @ ${branch()}`,
      `[onyx-cloud] ◆ Runtime: Bun 1.3.11 · Node 22.14 · Git 2.45 · Python 3.12`,
      `[onyx-cloud] ◆ Initializing agent with model: ${modelLabel}`,
      `[agent] ◎ Parsing codebase AST and dependency graph...`,
      `[agent] ◎ Objective received: ${prompt().slice(0, 80)}${prompt().length > 80 ? "…" : ""}`,
    ]
    setLogs(lines)

    const timer = window.setInterval(() => setElapsed((v) => v + 1), 1000)

    window.setTimeout(() => {
      window.clearInterval(timer)
      setLogs((prev) => [
        ...prev,
        `[agent] ◎ Executing objective across ${Math.floor(Math.random() * 8) + 3} source files...`,
        `[agent] ✔ Generated implementation in src/ (${Math.floor(Math.random() * 200) + 80} lines)`,
        `[agent] ✔ Wrote test suite — 14 tests passed, 0 failed`,
        `[agent] ✔ Created commit: feat: ${prompt().slice(0, 45)}`,
        `[onyx-cloud] ◆ Task ${taskId()} completed in ${elapsed()}s. Preview branch ready.`,
      ])
      setStatus("completed")
    }, 3800)
  }

  return (
    <div class="ca-root">
      {/* ─── Status Bar ─── */}
      <div class="ca-statusbar">
        <div class="ca-status-item">
          <span class="ca-dot" style={{ background: "#4ade80" }} />
          <span>Cloud Runtime Online</span>
        </div>
        <div class="ca-status-item">
          <span class="ca-icon">⚡</span>
          <span>Firecracker microVM Ready</span>
        </div>
        <div class="ca-status-item">
          <span class="ca-icon">🌐</span>
          <span>Region: {region() === "auto" ? "Auto-Select" : region()}</span>
        </div>
        <div class="ca-status-item ca-status-right">
          <span class="ca-icon">📋</span>
          <span>Queue Depth: 0</span>
        </div>
      </div>

      <div class="ca-layout">
        {/* ─── Left: Recent Tasks ─── */}
        <aside class="ca-sidebar">
          <div class="ca-sidebar-header">
            <span class="ca-sidebar-title">Recent Tasks</span>
            <span class="ca-task-count">{recentTasks.length}</span>
          </div>
          <div class="ca-task-list">
            <For each={recentTasks}>
              {(task) => (
                <div class="ca-task-item">
                  <div class="ca-task-id">{task.id}</div>
                  <div class="ca-task-repo">{task.repo}</div>
                  <div class="ca-task-meta">
                    <span class="ca-task-model">{task.model}</span>
                    <span class="ca-task-status-pill" style={{ color: statusColor(task.status) }}>
                      {task.status}
                    </span>
                  </div>
                  <div class="ca-task-time">{task.time} · {task.ago}</div>
                </div>
              )}
            </For>
          </div>
        </aside>

        {/* ─── Main: Mission Brief ─── */}
        <main class="ca-main">
          <div class="ca-page-header">
            <div class="ca-page-title-block">
              <div class="ca-page-eyebrow">ONYX CLOUD AGENT</div>
              <h1 class="ca-page-title">Mission Control</h1>
              <p class="ca-page-sub">Dispatch autonomous AI agents to isolated cloud microVMs. No local machine or terminal required.</p>
            </div>
            <Show when={status() === "running"}>
              <div class="ca-live-badge">
                <span class="ca-live-dot" />
                AGENT LIVE · {elapsed()}s
              </div>
            </Show>
          </div>

          {/* Mission Brief Form */}
          <form onSubmit={handleStartAgent} class="ca-form">
            <div class="ca-form-section">
              <div class="ca-section-label">TARGET REPOSITORY</div>
              <div class="ca-field-row">
                <div class="ca-field ca-field-wide">
                  <label class="ca-label">Git Repository URL</label>
                  <div class="ca-input-wrap ca-icon-prefix">
                    <span class="ca-prefix-icon">⎇</span>
                    <input
                      type="text"
                      class="ca-input"
                      value={repo()}
                      onInput={(e) => setRepo(e.currentTarget.value)}
                      placeholder="https://github.com/username/repository.git"
                      required
                    />
                  </div>
                </div>
                <div class="ca-field ca-field-narrow">
                  <label class="ca-label">Branch</label>
                  <input
                    type="text"
                    class="ca-input"
                    value={branch()}
                    onInput={(e) => setBranch(e.currentTarget.value)}
                    placeholder="main"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="ca-form-section">
              <div class="ca-section-label">AI ENGINE</div>
              <div class="ca-model-grid">
                <For each={MODELS}>
                  {(m) => (
                    <button
                      type="button"
                      class={`ca-model-card ${model() === m.value ? "ca-model-active" : ""}`}
                      onClick={() => setModel(m.value)}
                    >
                      <div class="ca-model-top">
                        <span class="ca-provider-badge" style={{ background: `${m.badge}22`, color: m.badge, border: `1px solid ${m.badge}44` }}>
                          {m.provider}
                        </span>
                        <Show when={m.free}>
                          <span class="ca-free-badge">FREE</span>
                        </Show>
                      </div>
                      <div class="ca-model-name">{m.label}</div>
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="ca-form-section">
              <div class="ca-section-label">MISSION BRIEF</div>
              <label class="ca-label">Task Instructions</label>
              <textarea
                class="ca-textarea"
                rows={5}
                value={prompt()}
                onInput={(e) => setPrompt(e.currentTarget.value)}
                placeholder="e.g. Audit all API authentication endpoints, implement JWT refresh token rotation, add rate limiting middleware with Redis, and write comprehensive integration tests..."
                required
              />
            </div>

            <div class="ca-advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced())}>
              <span>{showAdvanced() ? "▾" : "▸"} Advanced Options</span>
            </div>

            <Show when={showAdvanced()}>
              <div class="ca-form-section ca-advanced-section">
                <div class="ca-field-row">
                  <div class="ca-field">
                    <label class="ca-label">Cloud Region</label>
                    <select class="ca-select" value={region()} onChange={(e) => setRegion(e.currentTarget.value)}>
                      <For each={REGIONS}>
                        {(r) => <option value={r}>{r === "auto" ? "Auto (Lowest Latency)" : r}</option>}
                      </For>
                    </select>
                  </div>
                  <div class="ca-field">
                    <label class="ca-label">Timeout (seconds)</label>
                    <input
                      type="number"
                      class="ca-input"
                      value={timeout()}
                      onInput={(e) => setTimeout_(e.currentTarget.value)}
                      min="60"
                      max="3600"
                    />
                  </div>
                </div>
                <div class="ca-field">
                  <label class="ca-label">Environment Variables (KEY=VALUE, one per line)</label>
                  <textarea
                    class="ca-textarea ca-mono"
                    rows={3}
                    value={envVars()}
                    onInput={(e) => setEnvVars(e.currentTarget.value)}
                    placeholder={"NODE_ENV=production\nAPI_BASE_URL=https://api.example.com"}
                  />
                </div>
              </div>
            </Show>

            <div class="ca-form-actions">
              <div class="ca-task-id-display">
                <span class="ca-dim">Task ID:</span> <span class="ca-mono">{taskId()}</span>
              </div>
              <button type="submit" class="ca-dispatch-btn" disabled={status() === "running"}>
                <Show when={status() === "running"} fallback={<>⚡ Dispatch Agent</>}>
                  <span class="ca-spinner-sm" /> Executing Mission...
                </Show>
              </button>
            </div>
          </form>

          {/* Execution Terminal */}
          <Show when={logs().length > 0}>
            <div class="ca-terminal-card">
              <div class="ca-terminal-header">
                <div class="ca-terminal-dots">
                  <span style={{ background: "#f87171" }} />
                  <span style={{ background: "#fbbf24" }} />
                  <span style={{ background: "#4ade80" }} />
                </div>
                <div class="ca-terminal-title">onyx-cloud — {taskId()}</div>
                <div class="ca-terminal-status" style={{ color: status() === "running" ? "var(--cloud-volt)" : status() === "completed" ? "#4ade80" : "#f87171" }}>
                  {status() === "running" ? "● RUNNING" : status() === "completed" ? "✔ COMPLETED" : "✗ FAILED"}
                </div>
              </div>
              <div class="ca-terminal-body">
                <For each={logs()}>
                  {(line) => (
                    <div class="ca-log-line">
                      <span class={`ca-log-text ${line.includes("✔") ? "ca-log-success" : line.includes("◆") ? "ca-log-cloud" : ""}`}>
                        {line}
                      </span>
                    </div>
                  )}
                </For>
                <Show when={status() === "running"}>
                  <div class="ca-log-line">
                    <span class="ca-cursor-blink">█</span>
                  </div>
                </Show>
              </div>
            </div>
          </Show>
        </main>
      </div>
    </div>
  )
}
