import { useLocation } from "@solidjs/router"
import { createMemo } from "solid-js"

export type AppHeaderProps = {
  collapsed?: boolean
  onToggleSidebar?: () => void
}

export function AppHeader(props: AppHeaderProps) {
  const loc = useLocation()

  const title = createMemo(() => {
    const p = loc.pathname
    if (p.startsWith("/organizations")) return "Organizations"
    if (p.startsWith("/usage")) return "Usage"
    if (p.startsWith("/cloud-agent")) return "Cloud Agent"
    if (p.startsWith("/sessions")) return "Sessions"
    if (p.startsWith("/webhooks")) return "Webhooks / Triggers"
    if (p.startsWith("/code-reviewer")) return "Code Reviewer"
    if (p.startsWith("/security-agent")) return "Security Agent"
    if (p.startsWith("/projects")) return "Projects"
    return "Profile"
  })

  return (
    <header class="cloud-top-header">
      <div class="cloud-top-left">
        <button
          type="button"
          class="btn-sidebar-toggle"
          onClick={() => props.onToggleSidebar?.()}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
        <span class="cloud-breadcrumb">{title()}</span>
      </div>

      <div class="cloud-top-right">
        <div class="cloud-top-btn" title="Onyx Cloud API & Inference is fully operational">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#4ade80;"></span>
          <span>Online</span>
        </div>
        <a class="cloud-top-btn" href="https://oynx.si" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span>Docs</span>
        </a>
      </div>
    </header>
  )
}
