import { createSignal, For, Show } from "solid-js"

type Session = {
  id: string
  title: string
  repo: string
  model: string
  duration: string
  tokens: string
  status: "Completed" | "Running" | "Failed"
  date: string
  diffPreview: string
}

export function SessionsRoute() {
  const [filter, setFilter] = createSignal<"all" | "completed" | "running">("all")
  const [selectedSession, setSelectedSession] = createSignal<Session | null>(null)

  const sessions: Session[] = [
    {
      id: "OX-9421",
      title: "Implement BYOAI Custom Provider configuration in IDE settings",
      repo: "Manash8666/oynx",
      model: "Auto Model (Claude 3.7)",
      duration: "4m 12s",
      tokens: "32.4K",
      status: "Completed",
      date: "25 minutes ago",
      diffPreview: "+ export interface CustomProviderConfig {\n+   id: string;\n+   name: string;\n+   baseUrl: string;\n+   apiKey: string;\n+   models: ModelDefinition[];\n+ }\n+ // Added BYOAI settings tab in editor preferences",
    },
    {
      id: "OX-9388",
      title: "Audit high-throughput token streaming endpoints and optimize cache headers",
      repo: "Manash8666/oynx",
      model: "DeepSeek V3",
      duration: "2m 45s",
      tokens: "18.1K",
      status: "Completed",
      date: "2 hours ago",
      diffPreview: "@@ -45,7 +45,9 @@\n- res.setHeader('Cache-Control', 'no-cache');\n+ res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');\n+ res.setHeader('Vary', 'Accept-Encoding');",
    },
    {
      id: "OX-9310",
      title: "Configure Webhook auto-responder for PR alerts and issue tagging",
      repo: "Manash8666/oynx",
      model: "Auto Model (Nemotron 3.5)",
      duration: "6m 02s",
      tokens: "41.0K",
      status: "Completed",
      date: "Yesterday",
      diffPreview: "+ export async function verifyWebhookSignature(payload: string, secret: string, signature: string) {\n+   const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');\n+   return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));\n+ }",
    },
  ]

  const filteredSessions = () => {
    if (filter() === "completed") return sessions.filter((s) => s.status === "Completed")
    if (filter() === "running") return sessions.filter((s) => s.status === "Running")
    return sessions
  }

  return (
    <div class="cloud-view-container">
      <div class="cloud-page-header">
        <div>
          <h1>Sessions History</h1>
          <p>Inspect autonomous cloud agent runs, review generated git diffs, and inspect token consumption.</p>
        </div>
      </div>

      <div style="display:flex;gap:0.5rem;border-bottom:1px solid var(--cloud-card-border);padding-bottom:0.75rem;">
        <button
          type="button"
          class="cadence-btn"
          classList={{ active: filter() === "all" }}
          onClick={() => setFilter("all")}
        >
          All Sessions ({sessions.length})
        </button>
        <button
          type="button"
          class="cadence-btn"
          classList={{ active: filter() === "completed" }}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          type="button"
          class="cadence-btn"
          classList={{ active: filter() === "running" }}
          onClick={() => setFilter("running")}
        >
          Running (0)
        </button>
      </div>

      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <For each={filteredSessions()}>
          {(session) => (
            <div
              style="background:var(--cloud-card-bg);border:1px solid var(--cloud-card-border);border-radius:10px;padding:1.25rem;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:border-color 0.15s ease;"
              onClick={() => setSelectedSession(session)}
            >
              <div style="display:flex;flex-direction:column;gap:0.35rem;max-width:70%;">
                <div style="display:flex;align-items:center;gap:0.5rem;">
                  <span style="font-family:var(--font-family-mono, monospace);font-size:0.75rem;color:var(--cloud-volt);font-weight:700;">
                    {session.id}
                  </span>
                  <span style="font-size:0.875rem;font-weight:600;color:#fff;">{session.title}</span>
                </div>
                <div style="font-size:0.75rem;color:var(--cloud-muted);display:flex;gap:0.75rem;">
                  <span>Repo: {session.repo}</span>
                  <span>•</span>
                  <span>Model: {session.model}</span>
                  <span>•</span>
                  <span>{session.tokens} tokens</span>
                  <span>•</span>
                  <span>{session.duration}</span>
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:1rem;">
                <span style="font-size:0.75rem;color:var(--cloud-dim);">{session.date}</span>
                <span style="font-size:0.75rem;padding:0.25rem 0.5rem;background:rgba(74,222,128,0.12);color:#4ade80;border-radius:4px;font-weight:600;">
                  {session.status}
                </span>
                <button type="button" class="btn-secondary" style="font-size:0.75rem;padding:0.35rem 0.75rem;">
                  View Diff
                </button>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Diff Inspector Modal */}
      <Show when={selectedSession()}>
        {(session) => (
          <div class="cloud-modal-overlay" onClick={() => setSelectedSession(null)}>
            <div class="cloud-modal-card" style="max-width:680px;" onClick={(e) => e.stopPropagation()}>
              <div class="cloud-modal-header">
                <div>
                  <h3 style="margin:0;">Session {session().id} Diff</h3>
                  <span style="font-size:0.75rem;color:var(--cloud-muted);">{session().title}</span>
                </div>
                <button type="button" class="btn-close-modal" onClick={() => setSelectedSession(null)}>
                  ✕
                </button>
              </div>

              <div
                style="background:#07080a;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:1rem;font-family:var(--font-family-mono, monospace);font-size:0.8125rem;line-height:1.6;color:#e4e4e7;max-height:350px;overflow-y:auto;white-space:pre-wrap;"
              >
                {session().diffPreview}
              </div>

              <div class="cloud-modal-actions">
                <button type="button" class="btn-secondary" onClick={() => setSelectedSession(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}
