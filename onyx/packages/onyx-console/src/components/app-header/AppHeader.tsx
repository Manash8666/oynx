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
    if (p.startsWith("/organizations")) return "Organizations & Team Seats"
    if (p.startsWith("/usage")) return "Telemetry & Inference Breakdown"
    if (p.startsWith("/cloud-agent")) return "Cloud IDE Agent · Autonomous Workbench"
    if (p.startsWith("/sessions")) return "Active Sessions & Swarms"
    if (p.startsWith("/webhooks")) return "CI/CD Webhooks & Triggers"
    if (p.startsWith("/code-reviewer")) return "AST Code Reviewer"
    if (p.startsWith("/security-agent")) return "Security & SAST Agent"
    if (p.startsWith("/projects")) return "Active Workspaces"
    return "Developer Command Center"
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
        <div class="cloud-breadcrumb-group">
          <span class="cloud-breadcrumb-brand">Onyx Cloud</span>
          <span class="cloud-breadcrumb-sep">/</span>
          <span class="cloud-breadcrumb">{title()}</span>
        </div>
      </div>

      <div class="cloud-top-right">
        <div class="cloud-status-pill" title="In-process compiler verification and AST linting are active">
          <span class="pulse-dot green"></span>
          <span>AST Verifier: Active</span>
        </div>
        <div class="cloud-status-pill" title="Firecracker MicroVM Swarm cluster SLA">
          <span class="pulse-dot volt"></span>
          <span>US-East Cluster: 99.98% SLA</span>
        </div>
        <a class="cloud-btn-ide-launch" href="/cloud-agent" title="Launch Cloud IDE Autonomous Workbench">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Open IDE</span>
        </a>
        <a class="cloud-top-btn" href="https://oynx.si" target="_blank" rel="noreferrer" title="Documentation">
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
