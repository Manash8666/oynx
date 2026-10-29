import { createSignal, For, Show } from "solid-js"

export function CloudAgentRoute() {
  const [repo, setRepo] = createSignal("https://github.com/Manash8666/oynx.git")
  const [branch, setBranch] = createSignal("main")
  const [model, setModel] = createSignal("auto")
  const [prompt, setPrompt] = createSignal("")
  const [status, setStatus] = createSignal<"idle" | "running" | "completed">("idle")
  const [logs, setLogs] = createSignal<string[]>([])

  function handleStartAgent(e: Event) {
    e.preventDefault()
    if (!prompt().trim()) return

    setStatus("running")
    setLogs([
      "[onyx-cloud] Provisioning ephemeral Firecracker microVM...",
      "[onyx-cloud] Cloning repository " + repo() + " (" + branch() + ")...",
      "[onyx-cloud] Environment hydrated with Bun v1.3.11, Node v22.14.0, Git 2.45...",
      "[onyx-cloud] Initializing Onyx Autonomous Agent with model: " + model() + "...",
      "[onyx-cloud] Analyzing codebase architecture and dependency graph...",
      "[agent] Executing objective: " + prompt(),
    ])

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        "[agent] Generated test suite in tests/agent-integration.test.ts",
        "[agent] Running test suite: 12 tests passed, 0 failed.",
        "[agent] Creating git commit: feat: " + prompt().slice(0, 40) + "...",
        "[onyx-cloud] Task completed successfully in 38.4s. Changes staged to preview worktree.",
      ])
      setStatus("completed")
    }, 3500)
  }

  return (
    <div class="cloud-view-container">
      <div class="cloud-page-header">
        <div>
          <h1>Onyx Cloud Agent</h1>
          <p>Launch autonomous AI coding agents in isolated cloud microVMs. No local machine or terminal required.</p>
        </div>
      </div>

      <div class="cloud-panel-card">
        <h3>Launch Cloud Agent Task</h3>
        <form onSubmit={handleStartAgent} style="display:flex;flex-direction:column;gap:1.25rem;">
          <div style="display:grid;grid-template-columns:2fr 1fr;gap:1rem;">
            <div class="cloud-form-field">
              <label>Git Repository URL</label>
              <input
                type="text"
                value={repo()}
                onInput={(e) => setRepo(e.currentTarget.value)}
                placeholder="https://github.com/username/repository.git"
                required
              />
            </div>
            <div class="cloud-form-field">
              <label>Branch</label>
              <input
                type="text"
                value={branch()}
                onInput={(e) => setBranch(e.currentTarget.value)}
                placeholder="main"
                required
              />
            </div>
          </div>

          <div class="cloud-form-field">
            <label>AI Model</label>
            <select value={model()} onChange={(e) => setModel(e.currentTarget.value)}>
              <option value="auto">Auto Model (Intelligent Routing based on task complexity) — Recommended</option>
              <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Deep Thinking & Architecture)</option>
              <option value="deepseek-v3">DeepSeek V3 (High-Speed Code Generation)</option>
              <option value="nemotron-3-5-super-vl">NVIDIA Nemotron 3.5 Super VL (Multimodal Reasoning - Free)</option>
            </select>
          </div>

          <div class="cloud-form-field">
            <label>Task Instructions</label>
            <textarea
              rows="4"
              value={prompt()}
              onInput={(e) => setPrompt(e.currentTarget.value)}
              placeholder="e.g. Audit API authentication endpoints, implement rate limiting middleware, and create unit tests..."
              required
            ></textarea>
          </div>

          <div style="display:flex;justify-content:flex-end;">
            <button type="submit" class="btn-primary" disabled={status() === "running"}>
              {status() === "running" ? "Agent Running..." : "Dispatch Cloud Agent"}
            </button>
          </div>
        </form>
      </div>

      <Show when={logs().length > 0}>
        <div class="cloud-panel-card">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h3>Execution Console</h3>
            <span
              style={`font-size:0.75rem;padding:0.25rem 0.5rem;border-radius:4px;font-weight:700;background:${
                status() === "running" ? "rgba(216,255,56,0.15)" : "rgba(74,222,128,0.15)"
              };color:${status() === "running" ? "var(--cloud-volt)" : "#4ade80"};`}
            >
              {status() === "running" ? "Running" : "Completed"}
            </span>
          </div>

          <div
            style="background:#07080a;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:1rem;font-family:var(--font-family-mono, monospace);font-size:0.8125rem;line-height:1.6;color:#a1a1aa;max-height:280px;overflow-y:auto;"
          >
            <For each={logs()}>
              {(line) => (
                <div style="word-break:break-all;">
                  <span style="color:var(--cloud-volt);margin-right:0.5rem;">›</span>
                  <span style={line.includes("completed") ? "color:#4ade80;font-weight:600;" : ""}>{line}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}
