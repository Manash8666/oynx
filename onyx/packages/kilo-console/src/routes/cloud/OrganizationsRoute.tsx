import { createSignal, For, Show } from "solid-js"

type Organization = {
  id: string
  name: string
  role: string
  members: number
  tier: string
}

export function OrganizationsRoute() {
  const [orgs, setOrgs] = createSignal<Organization[]>([
    {
      id: "org_personal",
      name: "Personal Account",
      role: "Owner",
      members: 1,
      tier: "Starter",
    },
  ])
  const [showCreateModal, setShowCreateModal] = createSignal(false)
  const [newOrgName, setNewOrgName] = createSignal("")
  const [inviteEmail, setInviteEmail] = createSignal("")

  function handleCreateOrg(e: Event) {
    e.preventDefault()
    if (!newOrgName().trim()) return
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name: newOrgName().trim(),
      role: "Owner",
      members: 1,
      tier: "Team Pro",
    }
    setOrgs([...orgs(), newOrg])
    setNewOrgName("")
    setShowCreateModal(false)
  }

  return (
    <div class="cloud-view-container">
      <div class="cloud-page-header">
        <div>
          <h1>Organizations & Teams</h1>
          <p>Collaborate with your engineering team, share models, and pool Onyx Pass credits.</p>
        </div>
        <button type="button" class="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Organization
        </button>
      </div>

      <div class="cloud-panel-card">
        <h3>Active Workspaces</h3>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <For each={orgs()}>
            {(org) => (
              <div
                style="display:flex;align-items:center;justify-content:space-between;padding:1rem;background:#171a22;border:1px solid var(--cloud-card-border);border-radius:8px;"
              >
                <div style="display:flex;align-items:center;gap:0.875rem;">
                  <div
                    style="width:36px;height:36px;border-radius:8px;background:#202530;display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--cloud-volt);"
                  >
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style="font-weight:600;color:#fff;font-size:0.9375rem;">{org.name}</div>
                    <div style="font-size:0.75rem;color:var(--cloud-muted);">
                      {org.role} • {org.members} Member • {org.tier}
                    </div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                  <span style="font-size:0.75rem;padding:0.25rem 0.5rem;background:rgba(216,255,56,0.1);color:var(--cloud-volt);border-radius:4px;font-weight:600;">
                    Active
                  </span>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="cloud-panel-card">
        <h3>Invite Team Members</h3>
        <p style="font-size:0.8125rem;color:var(--cloud-muted);margin:0;">
          Add teammates by email to grant access to shared Cloud Agents, shared session histories, and unified model billing.
        </p>
        <div style="display:flex;gap:0.75rem;margin-top:0.5rem;">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail()}
            onInput={(e) => setInviteEmail(e.currentTarget.value)}
            style="flex:1;background:#0d0f14;border:1px solid var(--cloud-card-border);border-radius:6px;padding:0.5rem 0.75rem;color:#fff;font-size:0.8125rem;"
          />
          <button
            type="button"
            class="btn-secondary"
            onClick={() => {
              if (inviteEmail()) {
                alert(`Invite sent to ${inviteEmail()}`)
                setInviteEmail("")
              }
            }}
          >
            Send Invitation
          </button>
        </div>
      </div>

      <Show when={showCreateModal()}>
        <div class="cloud-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div class="cloud-modal-card" onClick={(e) => e.stopPropagation()}>
            <div class="cloud-modal-header">
              <h3>Create New Organization</h3>
              <button type="button" class="btn-close-modal" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateOrg} style="display:flex;flex-direction:column;gap:1rem;">
              <div class="cloud-form-field">
                <label>Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Engineering"
                  value={newOrgName()}
                  onInput={(e) => setNewOrgName(e.currentTarget.value)}
                  required
                />
              </div>
              <div class="cloud-modal-actions">
                <button type="button" class="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" class="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  )
}
