import { A, useLocation } from "@solidjs/router"
import { createMemo, createSignal, For, Show } from "solid-js"
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
  activeRule: (path: string) => boolean
}

export function AppSidebar(props: SidebarProps) {
  const loc = useLocation()
  const profile = createMemo(() => getStoredCloudProfile())

  const dashboardItems: NavItem[] = [
    {
      label: "Your Profile",
      href: "/profile",
      icon: "user",
      activeRule: (p) => p === "/profile" || p === "/" || p === "",
    },
    {
      label: "Organizations",
      href: "/organizations",
      icon: "building",
      activeRule: (p) => p.startsWith("/organizations"),
    },
    {
      label: "Usage",
      href: "/usage",
      icon: "chart",
      activeRule: (p) => p.startsWith("/usage"),
    },
  ]

  const cloudItems: NavItem[] = [
    {
      label: "Cloud Agent",
      href: "/cloud-agent",
      icon: "cloud",
      activeRule: (p) => p.startsWith("/cloud-agent"),
    },
    {
      label: "Sessions",
      href: "/sessions",
      icon: "terminal-list",
      activeRule: (p) => p.startsWith("/sessions"),
    },
    {
      label: "Webhooks / Triggers",
      href: "/webhooks",
      icon: "git-branch",
      activeRule: (p) => p.startsWith("/webhooks"),
    },
    {
      label: "Code Reviewer",
      href: "/code-reviewer",
      icon: "code-check",
      activeRule: (p) => p.startsWith("/code-reviewer"),
    },
    {
      label: "Security Agent",
      href: "/security-agent",
      icon: "shield",
      activeRule: (p) => p.startsWith("/security-agent"),
    },
  ]

  function renderIcon(icon: string) {
    if (icon === "user") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
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
    if (icon === "cloud") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      )
    }
    if (icon === "terminal-list") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
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
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
    }
    if (icon === "shield") {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
          <span class="cloud-brand-name brand-name">Onyx</span>
        </A>

        <nav class="sidebar-group">
          <span class="sidebar-group-title">Dashboard</span>
          <For each={dashboardItems}>
            {(item) => {
              const active = () => item.activeRule(loc.pathname)
              return (
                <A class="sidebar-item" classList={{ active: active() }} href={item.href} title={item.label}>
                  <span class="sidebar-icon">{renderIcon(item.icon)}</span>
                  <span class="sidebar-label">{item.label}</span>
                </A>
              )
            }}
          </For>
        </nav>

        <nav class="sidebar-group">
          <span class="sidebar-group-title">Cloud</span>
          <For each={cloudItems}>
            {(item) => {
              const active = () => item.activeRule(loc.pathname)
              return (
                <A class="sidebar-item" classList={{ active: active() }} href={item.href} title={item.label}>
                  <span class="sidebar-icon">{renderIcon(item.icon)}</span>
                  <span class="sidebar-label">{item.label}</span>
                </A>
              )
            }}
          </For>
        </nav>
      </div>

      <div class="cloud-sidebar-bottom">
        <div class="cloud-pass-card">
          <h4>Up to 50% Free AI Credits</h4>
          <p>Maximize your AI output per dollar with Onyx Pass</p>
          <A class="btn-get-pass" href="/profile#pass">
            Get Onyx Pass
          </A>
        </div>

        <A class="user-profile-bar" href="/profile">
          <div class="user-profile-info">
            <div class="user-avatar">MD</div>
            <div class="user-text user-info-text">
              <span class="user-text-name">{profile().profile.name || "Manash Dash"}</span>
              <span class="user-text-email">{profile().profile.email || "manashd8666@gmail.com"}</span>
            </div>
          </div>
          <svg class="user-info-text" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
          </svg>
        </A>
      </div>
    </aside>
  )
}
