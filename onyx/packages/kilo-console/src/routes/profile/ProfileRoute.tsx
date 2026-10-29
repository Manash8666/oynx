import { createSignal, createMemo, Show, For } from "solid-js"
import { getStoredCloudProfile, saveStoredCloudProfile, type KiloProfileData } from "../../client"

export function ProfileRoute() {
  const [profile, setProfile] = createSignal<KiloProfileData>(getStoredCloudProfile())
  const [cadence, setCadence] = createSignal<"monthly" | "yearly">("monthly")
  const [showEditModal, setShowEditModal] = createSignal(false)
  const [showReferModal, setShowReferModal] = createSignal(false)
  const [showCheckoutModal, setShowCheckoutModal] = createSignal<{ plan: string; price: string } | null>(null)
  const [copiedReferral, setCopiedReferral] = createSignal(false)

  // Form states for profile edit
  const [editName, setEditName] = createSignal(profile().profile.name || "Manash Dash")
  const [editEmail, setEditEmail] = createSignal(profile().profile.email || "manashd8666@gmail.com")
  const [editLinkedIn, setEditLinkedIn] = createSignal(
    typeof window !== "undefined" ? localStorage.getItem("onyx_linkedin") || "" : "",
  )
  const [editGitHub, setEditGitHub] = createSignal(
    typeof window !== "undefined" ? localStorage.getItem("onyx_github") || "" : "",
  )

  const linkedInDisplay = createMemo(() => {
    const val = editLinkedIn()
    return val ? `LinkedIn — ${val}` : "LinkedIn — Not set"
  })

  const gitHubDisplay = createMemo(() => {
    const val = editGitHub()
    return val ? `GitHub — ${val}` : "GitHub — Not set"
  })

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

  function handleCopyReferral() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText("https://oynx.si/invite/manashdash")
      setCopiedReferral(true)
      setTimeout(() => setCopiedReferral(false), 2000)
    }
  }

  const plans = [
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: "$19",
      yearlyPrice: "$15",
      paidCredits: "$19",
      recommended: false,
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: "$49",
      yearlyPrice: "$39",
      paidCredits: "$49",
      recommended: true,
    },
    {
      id: "expert",
      name: "Expert",
      monthlyPrice: "$199",
      yearlyPrice: "$159",
      paidCredits: "$199",
      recommended: false,
    },
  ]

  return (
    <div class="profile-cloud-container">
      {/* Top 2 Cards: Profile & Remaining Credits */}
      <div class="profile-top-grid">
        <div class="card-profile-summary">
          <div class="profile-summary-left">
            <div class="profile-avatar-large">MD</div>
            <div class="profile-user-details">
              <div class="profile-name-row">
                <h2>{profile().profile.name || "Manash Dash"}</h2>
                <button
                  type="button"
                  class="btn-edit-profile"
                  onClick={() => setShowEditModal(true)}
                  aria-label="Edit Profile"
                  title="Edit Profile"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <span class="profile-user-email">{profile().profile.email || "manashd8666@gmail.com"}</span>
              <div class="profile-social-row">
                <span>{linkedInDisplay()}</span>
                <span>•</span>
                <span>{gitHubDisplay()}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-remaining-credits">
          <span class="label">Remaining Credits</span>
          <span class="amount">${(profile().balance?.balance ?? 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Onyx Pass Section */}
      <div class="card-onyx-pass" id="pass">
        <div class="onyx-pass-header">
          <div class="onyx-pass-title-group">
            <div class="onyx-pass-crown-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
              </svg>
            </div>
            <div class="onyx-pass-title-text">
              <h3>Onyx Pass</h3>
              <p>Unlock up to 50% free credits. Checkout securely with Stripe.</p>
            </div>
          </div>

          <button type="button" class="btn-refer-earn" onClick={() => setShowReferModal(true)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Refer & earn</span>
            <span class="badge-new">NEW</span>
          </button>
        </div>

        {/* Billing cadence toggle */}
        <div class="cadence-row">
          <span>Billing cadence</span>
          <div class="cadence-toggle-container">
            <button
              type="button"
              class="cadence-btn"
              classList={{ active: cadence() === "monthly" }}
              onClick={() => setCadence("monthly")}
            >
              Monthly
            </button>
            <button
              type="button"
              class="cadence-btn"
              classList={{ active: cadence() === "yearly" }}
              onClick={() => setCadence("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* 3 Pricing Plans */}
        <div class="onyx-pass-pricing-grid">
          <For each={plans}>
            {(plan) => {
              const price = () => (cadence() === "monthly" ? plan.monthlyPrice : plan.yearlyPrice)
              return (
                <div class="pass-plan-card" classList={{ recommended: plan.recommended }}>
                  <Show when={plan.recommended}>
                    <div class="recommended-pill">Recommended</div>
                  </Show>

                  <div>
                    <div class="plan-head">
                      <h4>{plan.name}</h4>
                      <span class="plan-cadence-badge">{cadence() === "monthly" ? "Monthly" : "Yearly"}</span>
                    </div>

                    <div class="plan-price-row">
                      <span class="plan-price">{price()}</span>
                      <span class="plan-price-period">/month</span>
                    </div>

                    <div class="plan-features">
                      <div class="feature-item">
                        <span class="feature-check">✓</span>
                        <span>Includes {plan.paidCredits}/month paid credits</span>
                      </div>
                      <div class="feature-item">
                        <span class="feature-check">✓</span>
                        <span>Up to 40% free bonus credits</span>
                      </div>
                      <div class="feature-item bonus-text">
                        <span>Month 1: +10%; month 2: +50% free bonus credits</span>
                      </div>
                    </div>

                    <p class="plan-terms-text">
                      Each monthly base-credit allotment expires one year after issuance. Bonus-credit deadlines are
                      unchanged. Existing credits keep their current terms. Annual terms paid before this policy began
                      keep their original terms until renewal.
                    </p>
                  </div>

                  <button
                    type="button"
                    class="btn-plan-action"
                    onClick={() => setShowCheckoutModal({ plan: plan.name, price: price() })}
                  >
                    Subscribe to {plan.name}
                  </button>
                </div>
              )
            }}
          </For>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Show when={showEditModal()}>
        <div class="cloud-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div class="cloud-modal-card" onClick={(e) => e.stopPropagation()}>
            <div class="cloud-modal-header">
              <h3>Edit Profile</h3>
              <button type="button" class="btn-close-modal" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveProfile} style="display:flex;flex-direction:column;gap:1rem;">
              <div class="cloud-form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editName()}
                  onInput={(e) => setEditName(e.currentTarget.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div class="cloud-form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editEmail()}
                  onInput={(e) => setEditEmail(e.currentTarget.value)}
                  placeholder="Your email address"
                  required
                />
              </div>
              <div class="cloud-form-field">
                <label>LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={editLinkedIn()}
                  onInput={(e) => setEditLinkedIn(e.currentTarget.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div class="cloud-form-field">
                <label>GitHub Profile URL</label>
                <input
                  type="text"
                  value={editGitHub()}
                  onInput={(e) => setEditGitHub(e.currentTarget.value)}
                  placeholder="https://github.com/username"
                />
              </div>
              <div class="cloud-modal-actions">
                <button type="button" class="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" class="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      {/* Refer & Earn Modal */}
      <Show when={showReferModal()}>
        <div class="cloud-modal-overlay" onClick={() => setShowReferModal(false)}>
          <div class="cloud-modal-card" onClick={(e) => e.stopPropagation()}>
            <div class="cloud-modal-header">
              <h3>Refer Developers & Earn Credits</h3>
              <button type="button" class="btn-close-modal" onClick={() => setShowReferModal(false)}>
                ✕
              </button>
            </div>
            <p style="font-size:0.8125rem;color:var(--cloud-muted);margin:0;line-height:1.5;">
              Share your personal referral link. Whenever an engineer joins and subscribes to Onyx Pass, you receive
              <strong> 20% recurring credits </strong> directly to your account.
            </p>
            <div class="cloud-form-field">
              <label>Your Referral Link</label>
              <div style="display:flex;gap:0.5rem;">
                <input
                  type="text"
                  readonly
                  value="https://oynx.si/invite/manashdash"
                  style="flex:1;"
                />
                <button type="button" class="btn-primary" onClick={handleCopyReferral}>
                  {copiedReferral() ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
            <div style="background:#0d0f14;padding:0.75rem;border-radius:8px;border:1px solid var(--cloud-card-border);display:flex;justify-content:space-around;text-align:center;">
              <div>
                <span style="font-size:0.6875rem;color:var(--cloud-dim);">Referred Engineers</span>
                <div style="font-size:1.15rem;font-weight:700;color:#fff;">0</div>
              </div>
              <div>
                <span style="font-size:0.6875rem;color:var(--cloud-dim);">Credits Earned</span>
                <div style="font-size:1.15rem;font-weight:700;color:var(--cloud-volt);">$0.00</div>
              </div>
            </div>
            <div class="cloud-modal-actions">
              <button type="button" class="btn-secondary" onClick={() => setShowReferModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Stripe Checkout Modal */}
      <Show when={showCheckoutModal()}>
        {(checkout) => (
          <div class="cloud-modal-overlay" onClick={() => setShowCheckoutModal(null)}>
            <div class="cloud-modal-card" onClick={(e) => e.stopPropagation()}>
              <div class="cloud-modal-header">
                <h3>Subscribe to {checkout().plan}</h3>
                <button type="button" class="btn-close-modal" onClick={() => setShowCheckoutModal(null)}>
                  ✕
                </button>
              </div>
              <p style="font-size:0.8125rem;color:var(--cloud-muted);margin:0;line-height:1.5;">
                You are subscribing to <strong>Onyx Pass ({checkout().plan})</strong> at{" "}
                <strong>{checkout().price} / month</strong> billed {cadence()}. Checkouts are encrypted and powered by
                Stripe.
              </p>
              <div style="background:#0d0f14;padding:1rem;border-radius:8px;border:1px solid var(--cloud-card-border);display:flex;flex-direction:column;gap:0.5rem;font-size:0.8125rem;">
                <div style="display:flex;justify-content:space-between;">
                  <span>Plan</span>
                  <span style="color:#fff;font-weight:600;">{checkout().plan} Tier</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span>Monthly Base Credits</span>
                  <span style="color:var(--cloud-volt);font-weight:600;">{checkout().price}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span>Bonus Free Credits</span>
                  <span style="color:#4ade80;font-weight:600;">Up to 50%</span>
                </div>
              </div>
              <div class="cloud-modal-actions">
                <button type="button" class="btn-secondary" onClick={() => setShowCheckoutModal(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn-primary"
                  onClick={() => {
                    const priceNum = parseFloat(checkout().price.replace("$", ""))
                    const updated = saveStoredCloudProfile({ balance: priceNum })
                    setProfile(updated)
                    setShowCheckoutModal(null)
                    alert(`Success! Onyx Pass (${checkout().plan}) activated. ${checkout().price} credits added to your balance.`)
                  }}
                >
                  Confirm & Checkout with Stripe
                </button>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}
