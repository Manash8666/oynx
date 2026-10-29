import { createSignal, For, Show } from "solid-js"

type Webhook = {
  id: string
  name: string
  trigger: string
  target: string
  status: "Active" | "Paused"
  lastTriggered: string
}

export function WebhooksRoute() {
  const [webhooks, setWebhooks] = createSignal<Webhook[]>([
    {
      id: "wh_01",
      name: "GitHub PR Auto-Reviewer",
      trigger: "pull_request: opened, synchronize",
      target: "Dispatch AI Code Reviewer",
      status: "Active",
      lastTriggered: "14 minutes ago",
    },
    {
      id: "wh_02",
      name: "Autonomous Bug Fixer on Issue Label",
      trigger: "issues: labeled 'ai-fix'",
      target: "Dispatch Onyx Cloud Agent",
      status: "Active",
      lastTriggered: "2 hours ago",
    },
  ])

  const [showAddModal, setShowAddModal] = createSignal(false)
  const [name, setName] = createSignal("")
  const [event, setEvent] = createSignal("pull_request")

  function handleCreateWebhook(e: Event) {
    e.preventDefault()
    if (!name().trim()) return
    const wh: Webhook = {
      id: `wh_${Date.now()}`,
      name: name().trim(),
      trigger: event() + ": all",
      target: "Dispatch Onyx Cloud Agent",
      status: "Active",
      lastTriggered: "Never",
    }
    setWebhooks([...webhooks(), wh])
    setName("")
    setShowAddModal(false)
  }

  return (
    <div class="cloud-view-container">
      <div class="cloud-page-header">
        <div>
          <h1>Webhooks & Triggers</h1>
          <p>Automate your developer workflow by triggering Cloud Agents on GitHub PRs, commits, or REST webhooks.</p>
        </div>
        <button type="button" class="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Trigger
        </button>
      </div>

      <div class="cloud-panel-card">
        <h3>Connected Triggers</h3>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <For each={webhooks()}>
            {(wh) => (
              <div
                style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:#171a22;border:1px solid var(--cloud-card-border);border-radius:8px;"
              >
                <div>
                  <div style="font-weight:600;color:#fff;font-size:0.9375rem;">{wh.name}</div>
                  <div style="font-size:0.75rem;color:var(--cloud-muted);margin-top:0.25rem;">
                    Trigger: <span style="font-family:var(--font-family-mono, monospace);color:var(--cloud-volt);">{wh.trigger}</span> • Action: {wh.target}
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:1rem;">
                  <span style="font-size:0.75rem;color:var(--cloud-dim);">Last fired: {wh.lastTriggered}</span>
                  <span style="font-size:0.75rem;padding:0.25rem 0.5rem;background:rgba(74,222,128,0.12);color:#4ade80;border-radius:4px;font-weight:600;">
                    {wh.status}
                  </span>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="cloud-panel-card">
        <h3>Custom Webhook Endpoint</h3>
        <p style="font-size:0.8125rem;color:var(--cloud-muted);margin:0;">
          Send HTTP POST requests with a valid HMAC signature to dispatch an Onyx Cloud Agent programmatically.
        </p>
        <div class="cloud-form-field" style="margin-top:0.5rem;">
          <label>Endpoint URL</label>
          <input type="text" readonly value="https://api.oynx.si/v1/triggers/dispatch" />
        </div>
      </div>

      <Show when={showAddModal()}>
        <div class="cloud-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div class="cloud-modal-card" onClick={(e) => e.stopPropagation()}>
            <div class="cloud-modal-header">
              <h3>Create Webhook Trigger</h3>
              <button type="button" class="btn-close-modal" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateWebhook} style="display:flex;flex-direction:column;gap:1rem;">
              <div class="cloud-form-field">
                <label>Trigger Name</label>
                <input
                  type="text"
                  placeholder="e.g. Auto-Review Security PRs"
                  value={name()}
                  onInput={(e) => setName(e.currentTarget.value)}
                  required
                />
              </div>
              <div class="cloud-form-field">
                <label>Event Type</label>
                <select value={event()} onChange={(e) => setEvent(e.currentTarget.value)}>
                  <option value="pull_request">GitHub Pull Request (opened / synchronized)</option>
                  <option value="issue">GitHub Issue (labeled 'ai-fix')</option>
                  <option value="push">Git Push (commits on target branch)</option>
                </select>
              </div>
              <div class="cloud-modal-actions">
                <button type="button" class="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" class="btn-primary">
                  Create Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  )
}
