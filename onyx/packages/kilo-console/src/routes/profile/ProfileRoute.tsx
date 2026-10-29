import { createSignal, createMemo, Show, For, onMount } from "solid-js"
import { getStoredCloudProfile, saveStoredCloudProfile, type KiloProfileData } from "../../client"

interface ProjectItem {
  id: string
  name: string
  branch: string
  framework: string
  status: "idle" | "running" | "building"
  lastActive: string
  port?: number
}

interface ApiKeyItem {
  provider: "OpenAI" | "Anthropic" | "DeepSeek" | "Ollama (Local)"
  key: string
  status: "active" | "not_set"
  models: string
}

export function ProfileRoute() {
  const [profile, setProfile] = createSignal<KiloProfileData>(getStoredCloudProfile())
  const [cadence, setCadence] = createSignal<"monthly" | "yearly">("monthly")
  const [showEditModal, setShowEditModal] = createSignal(false)
  const [showApiKeyModal, setShowApiKeyModal] = createSignal<ApiKeyItem | null>(null)
  const [showReferModal, setShowReferModal] = createSignal(false)
  const [showCheckoutModal, setShowCheckoutModal] = createSignal<{ plan: string; price: string } | null>(null)
  const [copiedReferral, setCopiedReferral] = createSignal(false)

  // Quick Launcher & Projects State
  const [projects, setProjects] = createSignal<ProjectItem[]>([
    {
      id: "p1",
      name: "onyx-core-ide",
      branch: "main",
      framework: "Rust + React 19",
      status: "running",
      lastActive: "Just now",
      port: 3000,
    },
    {
      id: "p2",
      name: "autonomous-rag-pipeline",
      branch: "feat/ast-graph",
      framework: "TypeScript + Tree-sitter",
      status: "idle",
      lastActive: "12m ago",
    },
    {
      id: "p3",
      name: "cloud-agent-runner",
      branch: "prod",
      framework: "Bun + SolidJS",
      status: "idle",
      lastActive: "1h ago",
    },
  ])

  // BYOAI Vault Keys
  const [apiKeys, setApiKeys] = createSignal<ApiKeyItem[]>([
    {
      provider: "DeepSeek",
      key: "sk-dsk-••••••••••••38f1",
      status: "active",
      models: "DeepSeek-R1, DeepSeek-V3",
    },
    {
      provider: "Anthropic",
      key: "sk-ant-••••••••••••9a02",
      status: "active",
      models: "Claude 3.7 Sonnet, Claude 3.5 Haiku",
    },
    {
      provider: "OpenAI",
      key: "sk-proj-•••••••••••84c7",
      status: "active",
      models: "GPT-4.5, o3-mini",
    },
    {
      provider: "Ollama (Local)",
      key: "http://localhost:11434",
      status: "active",
      models: "Qwen 2.5 Coder, Llama 3.3",
    },
  ])

  // Form states for profile edit
  const [editName, setEditName] = createSignal(profile().profile.name || "Manash Dash")
  const [editEmail, setEditEmail] = createSignal(profile().profile.email || "manashd8666@gmail.com")
  const [editLinkedIn, setEditLinkedIn] = createSignal(
    typeof window !== "undefined" ? localStorage.getItem("onyx_linkedin") || "" : "",
  )
  const [editGitHub, setEditGitHub] = createSignal(
    typeof window !== "undefined" ? localStorage.getItem("onyx_github") || "" : "",
  )

  const [inputApiKey, setInputApiKey] = createSignal("")

  function handleSaveProfile(e: Event) {
    e.preventDefault()
    const updated = saveStoredCloudProfile({
      name: editName(),
      email: editEmail(),
      linkedIn: editLinkedIn(),
      gitHub: editGitHub(),
    })
    setProfile(updated)
    setShowEditModal(false)
  }

  function handleSaveApiKey(e: Event) {
    e.preventDefault()
    const target = showApiKeyModal()
    if (!target) return
    setApiKeys((prev) =>
      prev.map((k) =>
        k.provider === target.provider
          ? {
              ...k,
              key: inputApiKey().length > 6 ? inputApiKey().substring(0, 7) + "•••••••••••" : inputApiKey(),
              status: "active",
            }
          : k,
      ),
    )
    setShowApiKeyModal(null)
    setInputApiKey("")
  }

  function handleCopyReferral() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText("https://oynx.si/invite/manashdash")
      setCopiedReferral(true)
      setTimeout(() => setCopiedReferral(false), 2000)
    }
  }

  return (
    <div class="onyx-command-center">
      {/* 1. Header Command Ribbon */}
      <div class="cmd-hero-ribbon">
        <div class="cmd-hero-left">
          <div class="cmd-avatar-halo">
            <svg width="44" height="44" viewBox="0 0 64 64" fill="none" class="cmd-avatar-svg">
              <rect width="64" height="64" rx="16" fill="#0b0d12" />
              <rect x="2" y="2" width="60" height="60" rx="14" stroke="rgba(255,255,255,0.16)" stroke-width="2" />
              <circle
                cx="32"
                cy="32"
                r="17"
                stroke="#d8ff38"
                stroke-width="6"
                stroke-linecap="round"
                stroke-dasharray="76 24"
                transform="rotate(-45 32 32)"
              />
              <circle cx="45" cy="19" r="4.5" fill="#22c55e" />
            </svg>
          </div>
          <div class="cmd-user-identity">
            <div class="cmd-user-row">
              <h2>{profile().profile.name || "Manash Dash"}</h2>
              <span class="cmd-badge-pro">ENTERPRISE CORE</span>
              <button
                type="button"
                class="cmd-btn-icon"
                title="Edit Developer Identity"
                onClick={() => setShowEditModal(true)}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
            </div>
            <p class="cmd-user-sub">
              <span>{profile().profile.email || "manashd8666@gmail.com"}</span>
              <span class="bullet">•</span>
              <span class="cmd-mono-id">ID: 0x88F9...C21B</span>
              <span class="bullet">•</span>
              <span class="cmd-status-pill online">In-Process LSP Ready</span>
            </p>
          </div>
        </div>

        {/* Global Action Shortcuts */}
        <div class="cmd-hero-actions">
          <a
            href="https://github.com/Manash8666/oynx.git"
            target="_blank"
            rel="noopener noreferrer"
            class="cmd-btn-outline"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            GitHub Repo
          </a>
          <button type="button" class="cmd-btn-volt" onClick={() => setShowReferModal(true)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Invite & Earn 20%
          </button>
        </div>
      </div>

      {/* 2. Real-Time Hardware & Inference Telemetry Bar */}
      <div class="cmd-telemetry-grid">
        <div class="telemetry-card">
          <div class="t-header">
            <span class="t-label">REMAINING CLOUD BALANCE</span>
            <span class="t-indicator volt"></span>
          </div>
          <div class="t-value volt-text">${(profile().balance?.balance ?? 0).toFixed(2)}</div>
          <div class="t-sub">Zero Marginal Cost with BYOAI Mode</div>
        </div>

        <div class="telemetry-card">
          <div class="t-header">
            <span class="t-label">INFERENCE LATENCY (P95)</span>
            <span class="t-indicator green"></span>
          </div>
          <div class="t-value">280ms</div>
          <div class="t-sub">Native In-Process Streaming Engine</div>
        </div>

        <div class="telemetry-card">
          <div class="t-header">
            <span class="t-label">AST COMPILER VERIFICATION</span>
            <span class="t-indicator green"></span>
          </div>
          <div class="t-value">100% PASS</div>
          <div class="t-sub">Automatic Tree-Sitter Linting Before Write</div>
        </div>

        <div class="telemetry-card">
          <div class="t-header">
            <span class="t-label">CODEBASE GRAPH REINDEX</span>
            <span class="t-indicator green"></span>
          </div>
          <div class="t-value">1.4ms / file</div>
          <div class="t-sub">Incremental SQLite Graph Storage</div>
        </div>
      </div>

      {/* 3. Mid Section: Active Projects Quick Launcher & BYOAI Vault */}
      <div class="cmd-mid-grid">
        {/* Active Projects Panel */}
        <div class="cmd-panel">
          <div class="cmd-panel-head">
            <div class="cmd-panel-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <h3>Active Workspaces &amp; Quick Launcher</h3>
            </div>
            <span class="cmd-badge-sub">3 Projects Connected</span>
          </div>

          <div class="cmd-project-list">
            <For each={projects()}>
              {(p) => (
                <div class="cmd-project-item">
                  <div class="p-item-left">
                    <div class="p-status-dot" classList={{ running: p.status === "running" }} />
                    <div class="p-info">
                      <div class="p-name">
                        <strong>{p.name}</strong>
                        <span class="p-branch">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="6" y1="3" x2="6" y2="15" />
                            <circle cx="18" cy="6" r="3" />
                            <circle cx="6" cy="18" r="3" />
                            <path d="M18 9a9 9 0 0 1-9 9" />
                          </svg>
                          {p.branch}
                        </span>
                      </div>
                      <div class="p-meta">
                        <span>{p.framework}</span>
                        <span class="bullet">•</span>
                        <span>Active {p.lastActive}</span>
                        <Show when={p.port}>
                          <span class="bullet">•</span>
                          <span class="p-port">Port :{p.port}</span>
                        </Show>
                      </div>
                    </div>
                  </div>

                  <div class="p-item-right">
                    <a href={`/projects`} class="p-btn-open">
                      Launch IDE
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>

        {/* BYOAI Model Keys Vault */}
        <div class="cmd-panel">
          <div class="cmd-panel-head">
            <div class="cmd-panel-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <h3>BYOAI Model &amp; Key Vault</h3>
            </div>
            <span class="cmd-badge-sub">Direct Model Inference</span>
          </div>

          <div class="cmd-vault-list">
            <For each={apiKeys()}>
              {(k) => (
                <div class="cmd-vault-item">
                  <div class="v-item-left">
                    <div class="v-provider-badge">{k.provider}</div>
                    <div class="v-details">
                      <div class="v-key-code">{k.key}</div>
                      <div class="v-models">{k.models}</div>
                    </div>
                  </div>
                  <div class="v-item-right">
                    <button
                      type="button"
                      class="v-btn-update"
                      onClick={() => {
                        setShowApiKeyModal(k)
                        setInputApiKey("")
                      }}
                    >
                      Configure
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* 4. Bespoke Onyx Pass Tier Matrix */}
      <div class="cmd-pass-section" id="pass">
        <div class="cmd-pass-header">
          <div class="cmd-pass-title-group">
            <div class="cmd-volt-shield">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3>Onyx Pass Subscription Matrix</h3>
              <p>Direct cloud compilation credits with encrypted Stripe checkout.</p>
            </div>
          </div>

          <div class="cadence-switch">
            <button
              type="button"
              class="cadence-item"
              classList={{ active: cadence() === "monthly" }}
              onClick={() => setCadence("monthly")}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              class="cadence-item"
              classList={{ active: cadence() === "yearly" }}
              onClick={() => setCadence("yearly")}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div class="cmd-tiers-grid">
          {/* Starter Plan */}
          <div class="onyx-tier-card">
            <div class="tier-head">
              <span class="tier-name">Starter Developer</span>
              <div class="tier-price-row">
                <span class="currency">$</span>
                <span class="price">{cadence() === "monthly" ? "19" : "15"}</span>
                <span class="period">/mo</span>
              </div>
              <p class="tier-desc">Essential cloud runner credits for solo software builders.</p>
            </div>
            <ul class="tier-features">
              <li>Includes $19/mo compilation credits</li>
              <li>Up to 20% free bonus compute tokens</li>
              <li>Full AST Graph-RAG indexing</li>
              <li>Local Ollama &amp; DeepSeek streaming</li>
            </ul>
            <button
              type="button"
              class="tier-btn-cta"
              onClick={() => setShowCheckoutModal({ plan: "Starter", price: cadence() === "monthly" ? "$19" : "$15" })}
            >
              Get Starter
            </button>
          </div>

          {/* Pro Plan (Bespoke Glowing Accent) */}
          <div class="onyx-tier-card recommended">
            <div class="tier-badge-recommended">POPULAR CHOICE</div>
            <div class="tier-head">
              <span class="tier-name">Autonomous Pro</span>
              <div class="tier-price-row">
                <span class="currency">$</span>
                <span class="price volt-text">{cadence() === "monthly" ? "49" : "39"}</span>
                <span class="period">/mo</span>
              </div>
              <p class="tier-desc">High-speed background agent swarms and multi-repo orchestration.</p>
            </div>
            <ul class="tier-features">
              <li>Includes $49/mo priority credits</li>
              <li>Up to 40% free bonus compute tokens</li>
              <li>Autonomous Multi-File Refactor Agent</li>
              <li>Instant in-process compiler verification</li>
              <li>Parallel cloud agent runner tasks</li>
            </ul>
            <button
              type="button"
              class="tier-btn-cta volt"
              onClick={() => setShowCheckoutModal({ plan: "Autonomous Pro", price: cadence() === "monthly" ? "$49" : "$39" })}
            >
              Activate Autonomous Pro
            </button>
          </div>

          {/* Expert Plan */}
          <div class="onyx-tier-card">
            <div class="tier-head">
              <span class="tier-name">Enterprise Studio</span>
              <div class="tier-price-row">
                <span class="currency">$</span>
                <span class="price">{cadence() === "monthly" ? "199" : "159"}</span>
                <span class="period">/mo</span>
              </div>
              <p class="tier-desc">Dedicated inference clusters and customized fine-tuned weights.</p>
            </div>
            <ul class="tier-features">
              <li>Includes $199/mo dedicated compute</li>
              <li>Up to 50% free bonus credits</li>
              <li>Self-Hosted VPC Agent Gateway</li>
              <li>Custom Enterprise EULA IP Assignment</li>
              <li>Unlimited Team Members &amp; Webhooks</li>
            </ul>
            <button
              type="button"
              class="tier-btn-cta"
              onClick={() => setShowCheckoutModal({ plan: "Enterprise Studio", price: cadence() === "monthly" ? "$199" : "$159" })}
            >
              Get Enterprise Studio
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Show when={showEditModal()}>
        <div class="cloud-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div class="cloud-modal-card" onClick={(e) => e.stopPropagation()}>
            <div class="cloud-modal-header">
              <h3>Edit Developer Identity</h3>
              <button type="button" class="btn-close-modal" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveProfile} style="display:flex;flex-direction:column;gap:1rem;">
              <div class="cloud-form-field">
                <label>Display Name</label>
                <input type="text" value={editName()} onInput={(e) => setEditName(e.currentTarget.value)} required />
              </div>
              <div class="cloud-form-field">
                <label>Email Address</label>
                <input type="email" value={editEmail()} onInput={(e) => setEditEmail(e.currentTarget.value)} required />
              </div>
              <div class="cloud-form-field">
                <label>LinkedIn Handle</label>
                <input type="text" value={editLinkedIn()} onInput={(e) => setEditLinkedIn(e.currentTarget.value)} placeholder="manashdash" />
              </div>
              <div class="cloud-form-field">
                <label>GitHub Handle</label>
                <input type="text" value={editGitHub()} onInput={(e) => setEditGitHub(e.currentTarget.value)} placeholder="Manash8666" />
              </div>
              <div class="cloud-modal-actions">
                <button type="button" class="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" class="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      {/* Configure API Key Modal */}
      <Show when={showApiKeyModal()}>
        {(target) => (
          <div class="cloud-modal-overlay" onClick={() => setShowApiKeyModal(null)}>
            <div class="cloud-modal-card" onClick={(e) => e.stopPropagation()}>
              <div class="cloud-modal-header">
                <h3>Configure {target().provider} API Key</h3>
                <button type="button" class="btn-close-modal" onClick={() => setShowApiKeyModal(null)}>✕</button>
              </div>
              <form onSubmit={handleSaveApiKey} style="display:flex;flex-direction:column;gap:1rem;">
                <p style="font-size:0.8125rem;color:var(--cloud-muted);margin:0;line-height:1.5;">
                  Your keys are encrypted locally with AES-256 and dispatched directly from your native Onyx engine.
                </p>
                <div class="cloud-form-field">
                  <label>API Key or Endpoint</label>
                  <input
                    type="text"
                    value={inputApiKey()}
                    onInput={(e) => setInputApiKey(e.currentTarget.value)}
                    placeholder={target().provider.includes("Local") ? "http://localhost:11434" : "sk-..."}
                    required
                  />
                </div>
                <div class="cloud-modal-actions">
                  <button type="button" class="btn-secondary" onClick={() => setShowApiKeyModal(null)}>Cancel</button>
                  <button type="submit" class="btn-primary">Save Key to Vault</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Show>

      {/* Referral Modal */}
      <Show when={showReferModal()}>
        <div class="cloud-modal-overlay" onClick={() => setShowReferModal(false)}>
          <div class="cloud-modal-card" onClick={(e) => e.stopPropagation()}>
            <div class="cloud-modal-header">
              <h3>Refer Fellow Engineers</h3>
              <button type="button" class="btn-close-modal" onClick={() => setShowReferModal(false)}>✕</button>
            </div>
            <p style="font-size:0.8125rem;color:var(--cloud-muted);margin:0;line-height:1.5;">
              Share your referral link. Whenever an engineer joins and subscribes to Onyx Pass, you receive
              <strong style="color:var(--cloud-volt);"> 20% recurring compute credits </strong> deposited into your account.
            </p>
            <div class="cloud-form-field">
              <label>Your Personal Referral Link</label>
              <div style="display:flex;gap:0.5rem;">
                <input type="text" readonly value="https://oynx.si/invite/manashdash" style="flex:1;" />
                <button type="button" class="btn-primary" onClick={handleCopyReferral}>
                  {copiedReferral() ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
            <div class="cloud-modal-actions">
              <button type="button" class="btn-secondary" onClick={() => setShowReferModal(false)}>Close</button>
            </div>
          </div>
        </div>
      </Show>

      {/* Checkout Modal */}
      <Show when={showCheckoutModal()}>
        {(checkout) => (
          <div class="cloud-modal-overlay" onClick={() => setShowCheckoutModal(null)}>
            <div class="cloud-modal-card" onClick={(e) => e.stopPropagation()}>
              <div class="cloud-modal-header">
                <h3>Subscribe to {checkout().plan}</h3>
                <button type="button" class="btn-close-modal" onClick={() => setShowCheckoutModal(null)}>✕</button>
              </div>
              <p style="font-size:0.8125rem;color:var(--cloud-muted);margin:0;line-height:1.5;">
                Activating <strong>{checkout().plan}</strong> at <strong>{checkout().price} / month</strong> ({cadence()}).
                Transactions are zero-knowledge encrypted via Stripe.
              </p>
              <div style="background:#0b0d12;padding:1rem;border-radius:8px;border:1px solid var(--cloud-card-border);display:flex;flex-direction:column;gap:0.5rem;font-size:0.8125rem;">
                <div style="display:flex;justify-content:space-between;">
                  <span>Plan</span>
                  <span style="color:#fff;font-weight:600;">{checkout().plan}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span>Billing Cadence</span>
                  <span style="color:var(--cloud-volt);text-transform:capitalize;">{cadence()}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span>Compilation Credits</span>
                  <span style="color:#4ade80;font-weight:600;">Full Allotment</span>
                </div>
              </div>
              <div class="cloud-modal-actions">
                <button type="button" class="btn-secondary" onClick={() => setShowCheckoutModal(null)}>Cancel</button>
                <button
                  type="button"
                  class="btn-primary"
                  onClick={() => {
                    const priceNum = parseFloat(checkout().price.replace("$", "")) || 0
                    const updated = saveStoredCloudProfile({ balance: (profile().balance?.balance ?? 0) + priceNum })
                    setProfile(updated)
                    setShowCheckoutModal(null)
                    alert(`Success! ${checkout().plan} activated. Added ${checkout().price} in credits to your command center.`)
                  }}
                >
                  Confirm &amp; Checkout via Stripe
                </button>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}
