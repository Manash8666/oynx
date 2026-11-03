import { A, useLocation } from "@solidjs/router"
import { createMemo, For, Show } from "solid-js"
import { getStoredCloudProfile } from "../../client"
import type { Path } from "../../shared/navigation"

export type SidebarProps = {
  path?: Path
  collapsed?: boolean
  onToggle?: () => void
}

type NavItem = {
  label: string
  href: string
  icon: string
  badge?: string
  badgeColor?: string
  activeRule: (path: string) => boolean
}

type NavSection = {
  title: string
  items: NavItem[]
}

export function AppSidebar(props: SidebarProps) {
  const loc = useLocation()
  const profile = createMemo(() => getStoredCloudProfile())

  const sections: NavSection[] = [
    {
      title: "Core Workbench",
      items: [
        {
          label: "Desktop IDE (Studio)",
          href: "/desktop-ide",
          icon: "ide",
          badge: "DESKTOP",
          badgeColor: "#38bdf8",
          activeRule: (p) => p.startsWith("/desktop"),
        },
        {
          label: "Agent Lucifer (IDE)",
          href: "/cloud-agent",
          icon: "ide",
          badge: "DUAL",
          badgeColor: "#d8ff38",
          activeRule: (p) => p.startsWith("/cloud-agent"),
        },
        {
          label: "Command Center",
          href: "/profile",
          icon: "dashboard",
          activeRule: (p) => p === "/profile" || p === "/" || p === "",
        },
        {
          label: "Active Sessions",
          href: "/sessions",
          icon: "terminal-list",
          activeRule: (p) => p.startsWith("/sessions"),
        },
      ],
    },
    {
      title: "Intelligent Gates",
      items: [
        {
          label: "Lucifer AST Reviewer",
          href: "/code-reviewer",
          icon: "code-check",
          badge: "AST",
          badgeColor: "#3b82f6",
          activeRule: (p) => p.startsWith("/code-reviewer"),
        },
        {
          label: "Security & SAST",
          href: "/security-agent",
          icon: "shield",
          badge: "CVE",
          badgeColor: "#ec4899",
          activeRule: (p) => p.startsWith("/security-agent"),
        },
        {
          label: "CI/CD Webhooks",
          href: "/webhooks",
          icon: "git-branch",
          activeRule: (p) => p.startsWith("/webhooks"),
        },
      ],
    },
    {
      title: "Fleet & Workspace",
      items: [
        {
          label: "Telemetry & Inference",
          href: "/usage",
          icon: "chart",
          activeRule: (p) => p.startsWith("/usage"),
        },
        {
          label: "Organizations",
          href: "/organizations",
          icon: "building",
          activeRule: (p) => p.startsWith("/organizations"),
        },
      ],
    },
  ]

  function renderIcon(icon: string) {
    if (icon === "ide") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" stroke="currentColor" stroke-width="1.8" />
        </svg>
      )
    }
    if (icon === "dashboard") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      )
    }
    if (icon === "building") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M8 10h.01" />
          <path d="M16 10h.01" />
          <path d="M8 14h.01" />
          <path d="M16 14h.01" />
        </svg>
      )
    }
    if (icon === "chart") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    }
    if (icon === "terminal-list") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      )
    }
    if (icon === "git-branch") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      )
    }
    if (icon === "code-check") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <polyline points="9 15 11 17 15 13" />
        </svg>
      )
    }
    if (icon === "shield") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    }
    return null
  }

  return (
    <aside class="cloud-sidebar" classList={{ collapsed: Boolean(props.collapsed) }} aria-label="Cloud Navigation">
      <div class="cloud-sidebar-top">
        <A class="cloud-brand" href="/profile">
          <div class="cloud-brand-logo">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="#0b0d12" />
              <rect x="2" y="2" width="60" height="60" rx="14" stroke="rgba(255,255,255,0.14)" stroke-width="2" />
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
          <div class="cloud-brand-text">
            <span class="cloud-brand-name brand-name">Onyx</span>
            <span class="cloud-brand-badge">CLOUD CONSOLE</span>
          </div>
        </A>

        <For each={sections}>
          {(sec) => (
            <nav class="sidebar-group">
              <span class="sidebar-group-title">{sec.title}</span>
              <For each={sec.items}>
                {(item) => {
                  const active = () => item.activeRule(loc.pathname)
                  return (
                    <A class="sidebar-item" classList={{ active: active() }} href={item.href} title={item.label}>
                      <span class="sidebar-icon">{renderIcon(item.icon)}</span>
                      <span class="sidebar-label">{item.label}</span>
                      <Show when={item.badge}>
                        <span
                          class="sidebar-pill-badge"
                          style={{
                            background: `${item.badgeColor ?? "#d8ff38"}22`,
                            color: item.badgeColor ?? "#d8ff38",
                            border: `1px solid ${item.badgeColor ?? "#d8ff38"}44`,
                          }}
                        >
                          {item.badge}
                        </span>
                      </Show>
                    </A>
                  )
                }}
              </For>
            </nav>
          )}
        </For>
      </div>

      <div class="cloud-sidebar-bottom">
        <div class="onyx-cluster-widget">
          <div class="cluster-status-row">
            <span class="cluster-pulse"></span>
            <span class="cluster-name">Swarm US-East</span>
            <span class="cluster-badge">v2.4</span>
          </div>
          <div class="cluster-meta-row">
            <span>Firecracker MicroVM</span>
            <span class="cluster-tag">100% SLA</span>
          </div>
          <A class="cluster-tier-link" href="/profile#matrix">
            Enterprise Tier Active &rarr;
          </A>
        </div>

        <A class="user-profile-bar" href="/profile">
          <div class="user-profile-info">
            <div class="user-avatar">MD</div>
            <div class="user-text user-info-text">
              <span class="user-text-name">{profile().profile.name || "Manash Dash"}</span>
              <span class="user-text-role">FOUNDER · PRO OWNER</span>
            </div>
          </div>
          <span class="user-status-dot" title="Authenticated"></span>
        </A>
      </div>
    </aside>
  )
}
