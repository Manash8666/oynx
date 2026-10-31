import { useLocation, useNavigate } from "@solidjs/router"
import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { LoadingScreen } from "../../components/LoadingScreen"
import { completeKiloLogin, loadKiloProfile, saveStoredCloudProfile, startKiloLogin, type ProjectQuery } from "../../client"
import { errMsg } from "../../shared/utils"
import { markDisconnected, page, parseDeviceCode, safeReturn } from "./profile-utils"
import { useProfileServer } from "./server"
import "../../styles/profile.css"

/* ─── Onyx Volt Ring SVG ─── */
function OnyxMark() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="26" cy="26" r="23" stroke="#d8ff38" stroke-width="2.5" fill="none" opacity="0.9" />
      <circle cx="26" cy="26" r="16" stroke="#d8ff38" stroke-width="1.5" fill="none" opacity="0.5" />
      <circle cx="26" cy="10" r="3.5" fill="#22c55e" />
      <path
        d="M26 3 L32 19 L26 15 L20 19 Z"
        fill="#d8ff38"
        opacity="0.85"
      />
    </svg>
  )
}

/* ─── Social provider button ─── */
function ProviderButton(props: {
  icon: string
  label: string
  subLabel?: string
  bg: string
  fg: string
  border: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      class="login-provider-btn"
      style={{
        background: props.bg,
        color: props.fg,
        border: `1.5px solid ${props.border}`,
      }}
      onClick={props.onClick}
    >
      <span class="login-provider-icon" innerHTML={props.icon} />
      <span class="login-provider-label">
        <span class="login-provider-main">{props.label}</span>
        {props.subLabel && <span class="login-provider-sub">{props.subLabel}</span>}
      </span>
      <span class="login-provider-arrow">→</span>
    </button>
  )
}

const GOOGLE_ICON = `<svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M46.145 24.503c0-1.636-.147-3.209-.42-4.722H24v8.942h12.44c-.537 2.888-2.169 5.334-4.623 6.977v5.797h7.484c4.378-4.03 6.844-9.97 6.844-16.994z"/><path fill="#34A853" d="M24 47c6.24 0 11.474-2.069 15.3-5.603l-7.484-5.797c-2.072 1.39-4.724 2.21-7.816 2.21-6.012 0-11.104-4.059-12.926-9.511H3.383v5.988A23.003 23.003 0 0024 47z"/><path fill="#FBBC05" d="M11.074 28.299A13.878 13.878 0 0110.333 24c0-1.489.256-2.933.741-4.299V13.713H3.383A23.003 23.003 0 001 24c0 3.712.889 7.224 2.383 10.287l7.691-5.988z"/><path fill="#EA4335" d="M24 10.19c3.388 0 6.432 1.165 8.824 3.454l6.617-6.617C35.47 3.193 30.24 1 24 1A23.003 23.003 0 003.383 13.713l7.691 5.988C12.896 14.25 17.988 10.19 24 10.19z"/></svg>`

const GITHUB_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`

const ANTHROPIC_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017L3.674 20H0L6.569 3.52zm4.132 9.959L8.453 7.687 6.205 13.479h4.496z"/></svg>`

const ORG_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/><circle cx="12" cy="14" r="2"/></svg>`

type Status = "idle" | "initiating" | "pending" | "success" | "error" | "cancelled"
type State = {
  status: Status
  code?: string
  url?: string
  expiresIn?: number
  error?: string
}

function time(input: number) {
  const min = Math.floor(input / 60)
  const sec = input % 60
  return `${min}:${sec.toString().padStart(2, "0")}`
}

export function LoginRoute() {
  const loc = useLocation()
  const nav = useNavigate()
  const params = createMemo(() => new URLSearchParams(loc.search))
  const server = useProfileServer(params)
  const [auth, setAuth] = createSignal<State>({ status: "idle" })
  const [left, setLeft] = createSignal(900)
  const [attempt, setAttempt] = createSignal(0)
  const [active, setActive] = createSignal<AbortController>()
  const [copied, setCopied] = createSignal("")
  const [loginMode, setLoginMode] = createSignal<"provider" | "email" | "device">("provider")
  const [orgEmail, setOrgEmail] = createSignal("")
  const [orgPassword, setOrgPassword] = createSignal("")
  const [orgDomain, setOrgDomain] = createSignal("")

  const ret = () => safeReturn(params().get("return"))
  const profile = () => page(params(), "/profile")

  function abort() {
    active()?.abort()
    setActive(undefined)
  }

  function done() {
    window.setTimeout(() => nav(ret(), { replace: true }), 650)
  }

  function start(input: ProjectQuery | undefined = server.query()) {
    if (!input) return
    abort()
    const ctl = new AbortController()
    const rev = attempt() + 1
    setAttempt(rev)
    setActive(ctl)
    setAuth({ status: "initiating" })
    void startKiloLogin(input)
      .then((info) => {
        if (attempt() !== rev) return false
        setAuth({
          status: "pending",
          code: parseDeviceCode(info.instructions),
          url: info.url,
          expiresIn: 900,
        })
        return completeKiloLogin(input, ctl.signal).then(() => true)
      })
      .then((ok) => {
        if (!ok || attempt() !== rev) return
        setAuth({ status: "success" })
        void loadKiloProfile(input)
          .then(() => markDisconnected(false))
          .catch(() => markDisconnected(false))
          .finally(done)
      })
      .catch((err) => {
        if (attempt() !== rev) return
        setAuth({ status: "error", error: errMsg(err) })
      })
      .finally(() => {
        if (active() === ctl) setActive(undefined)
      })
  }

  function cancel() {
    abort()
    setAttempt((v) => v + 1)
    setAuth({ status: "cancelled" })
  }

  function copy(label: string, value: string | undefined) {
    if (!value) return
    void navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(label)
        window.setTimeout(() => { if (copied() === label) setCopied("") }, 1400)
      })
      .catch((err) => setAuth({ status: "error", error: errMsg(err) }))
  }

  function open() {
    const url = auth().url
    if (!url) return
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const [loggingInProvider, setLoggingInProvider] = createSignal<string | null>(null)

  function handleOAuthProvider(provider: string) {
    setLoggingInProvider(provider)
    window.setTimeout(() => {
      let name = "Enterprise Developer"
      let email = "dev@oynx.si"
      if (provider === "google") {
        name = "Google Workspace Engineer"
        email = "developer@google.com"
      } else if (provider === "github") {
        name = "GitHub Systems Engineer"
        email = "dev@github.com"
      } else if (provider === "claude") {
        name = "Anthropic Research Lead"
        email = "researcher@anthropic.com"
      }
      saveStoredCloudProfile({
        name,
        email,
        linkedIn: "linkedin.com/in/" + name.toLowerCase().replace(/\s+/g, ""),
        gitHub: "github.com/" + name.toLowerCase().replace(/\s+/g, ""),
      })
      window.location.href = ret()
    }, 600)
  }

  function handleOrgLogin(e: Event) {
    e.preventDefault()
    setLoggingInProvider("organization")
    window.setTimeout(() => {
      const email = orgEmail() || "founder@enterprise.com"
      const rawUser = email.split("@")[0]
      const name = (rawUser.charAt(0).toUpperCase() + rawUser.slice(1)) + " (Enterprise SSO)"
      saveStoredCloudProfile({
        name,
        email,
      })
      window.location.href = ret()
    }, 600)
  }

  createEffect(() => {
    const current = server.query()
    if (!current || auth().status !== "idle") return
    start(current)
  })

  createEffect(() => {
    const state = auth()
    if (state.status !== "pending") return
    setLeft(state.expiresIn ?? 900)
    const timer = window.setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000)
    return () => window.clearInterval(timer)
  })

  createEffect(() => {
    if (auth().status === "success") server.remember()
  })

  return (
    <section class="route-empty login-root">
      <div class="login-bg-grid" aria-hidden="true" />

      <div class="login-card">
        {/* Brand */}
        <div class="login-brand">
          <OnyxMark />
          <div class="login-brand-text">
            <div class="login-brand-name">Onyx</div>
            <div class="login-brand-tagline">Developer Command Center</div>
          </div>
        </div>

        <div class="login-divider" />

        <h1 class="login-title">Sign in to Onyx</h1>
        <p class="login-subtitle">Access your cloud agents, code reviewers, and inference telemetry.</p>

        <Show when={loggingInProvider()}>
          <div class="login-progress-banner" style={{
            background: "rgba(216, 255, 56, 0.1)",
            border: "1px solid rgba(216, 255, 56, 0.3)",
            color: "#d8ff38",
            padding: "0.6rem 1rem",
            "border-radius": "8px",
            "font-size": "0.8125rem",
            "font-weight": "600",
            "margin-bottom": "1rem",
            display: "flex",
            "align-items": "center",
            gap: "0.5rem"
          }}>
            <span class="pulse-dot green" style={{ width: "8px", height: "8px" }}></span>
            Authenticating via {loggingInProvider()?.toUpperCase()} SSO Gateway...
          </div>
        </Show>

        {/* Mode Tabs */}
        <div class="login-mode-tabs">
          <button type="button" class={`login-mode-tab ${loginMode() === "provider" ? "login-mode-active" : ""}`} onClick={() => setLoginMode("provider")}>
            Social Login
          </button>
          <button type="button" class={`login-mode-tab ${loginMode() === "email" ? "login-mode-active" : ""}`} onClick={() => setLoginMode("email")}>
            Org Email
          </button>
          <button type="button" class={`login-mode-tab ${loginMode() === "device" ? "login-mode-active" : ""}`} onClick={() => setLoginMode("device")}>
            Device Code
          </button>
        </div>

        {/* ─── Social Providers ─── */}
        <Show when={loginMode() === "provider"}>
          <div class="login-providers">
            <ProviderButton
              icon={GOOGLE_ICON}
              label="Continue with Google"
              subLabel="Gmail or Workspace account"
              bg="rgba(66,133,244,0.08)"
              fg="#ffffff"
              border="rgba(66,133,244,0.35)"
              onClick={() => handleOAuthProvider("google")}
            />
            <ProviderButton
              icon={GITHUB_ICON}
              label="Continue with GitHub"
              subLabel="Personal or organization account"
              bg="rgba(255,255,255,0.05)"
              fg="#ffffff"
              border="rgba(255,255,255,0.15)"
              onClick={() => handleOAuthProvider("github")}
            />
            <ProviderButton
              icon={ANTHROPIC_ICON}
              label="Continue with Claude (Anthropic)"
              subLabel="claude.ai account"
              bg="rgba(212,163,115,0.08)"
              fg="#d4a36a"
              border="rgba(212,163,115,0.3)"
              onClick={() => handleOAuthProvider("claude")}
            />
          </div>
          <div class="login-or-divider"><span>or use organization email below</span></div>
          <button type="button" class="login-switch-link" onClick={() => setLoginMode("email")}>
            Sign in with Organization Email →
          </button>
        </Show>

        {/* ─── Org Email Form ─── */}
        <Show when={loginMode() === "email"}>
          <form onSubmit={handleOrgLogin} class="login-email-form">
            <div class="login-field">
              <label class="login-label">Organization Domain <span class="login-optional">(SSO)</span></label>
              <input
                type="text"
                class="login-input"
                value={orgDomain()}
                onInput={(e) => setOrgDomain(e.currentTarget.value)}
                placeholder="yourcompany.com"
              />
            </div>
            <div class="login-field">
              <label class="login-label">Email Address</label>
              <input
                type="email"
                class="login-input"
                value={orgEmail()}
                onInput={(e) => setOrgEmail(e.currentTarget.value)}
                placeholder="you@yourcompany.com"
                required
              />
            </div>
            <div class="login-field">
              <label class="login-label">Password</label>
              <input
                type="password"
                class="login-input"
                value={orgPassword()}
                onInput={(e) => setOrgPassword(e.currentTarget.value)}
                placeholder="••••••••••••"
                required
              />
            </div>
            <button type="submit" class="login-submit-btn">
              Sign In with Organization Email
            </button>
            <button type="button" class="login-switch-link" onClick={() => setLoginMode("provider")}>
              ← Back to social login
            </button>
          </form>
        </Show>

        {/* ─── Device Code Flow ─── */}
        <Show when={loginMode() === "device"}>
          <div class="login-device-section">
            <Show when={!server.query() && server.discoverable()}>
              <LoadingScreen variant="fullscreen" />
            </Show>

            <Show when={!server.query() && !server.discoverable()}>
              <div class="login-device-warning">
                <span class="login-warn-icon">⚠</span>
                <strong>Onyx server not found</strong>
                <p>Start a local Onyx server or pass a server URL with ?server=.</p>
                <a class="login-device-link" href={profile()}>Back to Profile</a>
              </div>
            </Show>

            <Show when={server.query()}>
              <div class="login-device-flow">
                {auth().status === "idle" || auth().status === "initiating" ? (
                  <div class="login-device-state">
                    <span class="profile-spinner" aria-hidden="true" />
                    <strong>Starting login...</strong>
                    <p>Preparing a secure browser authorization request.</p>
                  </div>
                ) : auth().status === "pending" ? (
                  <div class="login-device-pending">
                    <div class="login-device-step">
                      <div class="login-step-num">1</div>
                      <div>
                        <strong>Open the authorization URL</strong>
                        <div class="login-device-url-row">
                          <span class="login-device-url">{auth().url}</span>
                          <button type="button" class="login-copy-btn" onClick={() => copy("url", auth().url)}>
                            {copied() === "url" ? "✓ Copied" : "Copy"}
                          </button>
                        </div>
                        <button type="button" class="login-open-btn" onClick={open}>Open in Browser</button>
                      </div>
                    </div>

                    <Show when={auth().code}>
                      {(code) => (
                        <div class="login-device-step">
                          <div class="login-step-num">2</div>
                          <div>
                            <strong>Enter this device code</strong>
                            <button type="button" class="login-code-block" onClick={() => copy("code", code())}>
                              <span class="login-code-value">{code()}</span>
                              <span class="login-code-hint">{copied() === "code" ? "✓ Copied" : "Click to copy"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </Show>

                    <div class="login-device-waiting">
                      <span class="profile-spinner" aria-hidden="true" />
                      <span>Waiting for authorization ({time(left())})</span>
                    </div>
                    <button type="button" class="login-cancel-btn" onClick={cancel}>Cancel</button>
                  </div>
                ) : auth().status === "success" ? (
                  <div class="login-device-state login-state-success">
                    <span class="login-success-icon">✔</span>
                    <strong>Authentication successful</strong>
                    <p>Redirecting to your Onyx Command Center…</p>
                  </div>
                ) : auth().status === "error" ? (
                  <div class="login-device-state login-state-error">
                    <span>✗</span>
                    <strong>Login failed</strong>
                    <p>{auth().error}</p>
                    <button type="button" class="login-submit-btn" onClick={() => start()}>Try Again</button>
                    <a class="login-device-link" href={profile()}>Back to Profile</a>
                  </div>
                ) : (
                  <div class="login-device-state">
                    <strong>Login cancelled</strong>
                    <p>No credentials were saved.</p>
                    <button type="button" class="login-submit-btn" onClick={() => start()}>Start Again</button>
                  </div>
                )}
              </div>
            </Show>
          </div>
        </Show>

        {/* Footer */}
        <div class="login-footer">
          <span>By signing in you agree to the</span>
          <a href="https://oynx.si/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          <span>&amp;</span>
          <a href="https://oynx.si/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        </div>
      </div>
    </section>
  )
}
