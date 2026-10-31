import { createSignal, For, Show } from "solid-js"

type FileItem = {
  name: string
  path: string
  type: "file" | "folder"
  isOpen?: boolean
  modified?: boolean
  children?: FileItem[]
}

const FILE_CONTENTS: Record<string, { code: string; lang: string }> = {
  "src/auth/provider.ts": {
    lang: "typescript",
    code: `import { OAuth2Client } from "@onyx/auth-sdk"
import { rotateSessionToken, verifyJwt } from "./jwt"
import { createDatabaseSession } from "./session"

export interface AuthConfig {
  providers: ("google" | "github" | "claude" | "sso")[]
  jwtSecret: string
  cookieDomain: string
  sessionTtlSeconds: number
}

// Onyx Multi-Provider Authentication Gateway
export class OnyxAuthProvider {
  private config: AuthConfig

  constructor(config: AuthConfig) {
    this.config = config
  }

  /**
   * Dispatches OAuth callback with PKCE verification and token rotation
   */
  async handleCallback(provider: string, code: string, state: string) {
    // Verified by Onyx In-Process Security Gate
    const client = new OAuth2Client({
      provider,
      clientId: process.env[\`\${provider.toUpperCase()}_CLIENT_ID\`],
      clientSecret: process.env[\`\${provider.toUpperCase()}_CLIENT_SECRET\`],
    })

    const tokenResponse = await client.exchangeCodeForToken({ code, state })
    const userProfile = await client.getUserProfile(tokenResponse.accessToken)

    // Issue rotated high-entropy JWT session
    const session = await createDatabaseSession({
      userId: userProfile.id,
      email: userProfile.email,
      provider,
      role: userProfile.domainRole ?? "developer",
    })

    return {
      session,
      jwt: rotateSessionToken(session),
      redirectUrl: "/command-center",
    }
  }
}`,
  },
  "src/auth/session.ts": {
    lang: "typescript",
    code: `import { ulid } from "ulid"

export interface UserSession {
  id: string
  userId: string
  email: string
  provider: string
  role: string
  createdAt: number
  expiresAt: number
}

export async function createDatabaseSession(params: Omit<UserSession, "id" | "createdAt" | "expiresAt">): Promise<UserSession> {
  const now = Date.now()
  return {
    id: "sess_" + ulid(),
    ...params,
    createdAt: now,
    expiresAt: now + 1000 * 60 * 60 * 24 * 7, // 7 days rolling
  }
}`,
  },
  "src/auth/jwt.ts": {
    lang: "typescript",
    code: `import crypto from "node:crypto"

export function rotateSessionToken(session: { id: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const payload = Buffer.from(JSON.stringify({
    sub: session.id,
    email: session.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 900, // 15 min TTL
  })).toString("base64url")

  const secret = process.env.JWT_SECRET || "onyx_dev_secret_key"
  const signature = crypto.createHmac("sha256", secret).update(\`\${header}.\${payload}\`).digest("base64url")

  return \`\${header}.\${payload}.\${signature}\`
}

export function verifyJwt(token: string): boolean {
  return token.split(".").length === 3
}`,
  },
  "src/agent/orchestrator.ts": {
    lang: "typescript",
    code: `import { ASTAnalyzer } from "./tools"
import { FirecrackerSandbox } from "./sandbox"

export class OnyxAgentOrchestrator {
  private sandbox: FirecrackerSandbox

  constructor() {
    this.sandbox = new FirecrackerSandbox({ region: "us-east-1", memoryMb: 2048 })
  }

  async executeTask(objective: string) {
    const ast = await ASTAnalyzer.parseCodebase("./src")
    const plan = await this.generateExecutionPlan(objective, ast)
    return await this.sandbox.runPlan(plan)
  }

  private async generateExecutionPlan(prompt: string, ast: unknown) {
    return { steps: ["ast_patch", "compiler_guard", "bun_test_runner"] }
  }
}`,
  },
  "src/agent/sandbox.ts": {
    lang: "typescript",
    code: `export class FirecrackerSandbox {
  private region: string
  private memoryMb: number

  constructor(opts: { region: string; memoryMb: number }) {
    this.region = opts.region
    this.memoryMb = opts.memoryMb
  }

  async runPlan(plan: { steps: string[] }) {
    return { status: "success", executionTimeMs: 384, exitCode: 0 }
  }
}`,
  },
  "src/agent/tools.ts": {
    lang: "typescript",
    code: `export const ASTAnalyzer = {
  async parseCodebase(dir: string) {
    return { symbols: 11043, errors: 0, circularDependencies: [] }
  }
}`,
  },
  "tests/auth.test.ts": {
    lang: "typescript",
    code: `import { describe, it, expect, beforeEach } from "bun:test"
import { OnyxAuthProvider } from "../src/auth/provider"

describe("OnyxAuthProvider - Multi-Provider SSO Suite", () => {
  let auth: OnyxAuthProvider

  beforeEach(() => {
    auth = new OnyxAuthProvider({
      providers: ["google", "github", "claude", "sso"],
      jwtSecret: "test-secret-rotated",
      cookieDomain: ".oynx.si",
      sessionTtlSeconds: 900,
    })
  })

  it("authenticates Google Workspace SSO tokens securely", async () => {
    const res = await auth.handleCallback("google", "auth_code_981", "valid_pkce_state")
    expect(res.session.email).toContain("@")
    expect(res.jwt).toBeDefined()
  })

  it("rotates JWT tokens on GitHub OAuth handshake", async () => {
    const res = await auth.handleCallback("github", "gh_code_442", "valid_pkce_state")
    expect(res.session.provider).toBe("github")
    expect(res.redirectUrl).toBe("/command-center")
  })
})`,
  },
  "package.json": {
    lang: "json",
    code: `{
  "name": "@onyx/platform-core",
  "version": "2.4.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@onyx/auth-sdk": "workspace:*",
    "@onyx/agent-orchestrator": "workspace:*",
    "bun": "^1.4.4"
  }
}`,
  },
  "onyx.config.ts": {
    lang: "typescript",
    code: `export default {
  runtime: "firecracker",
  compilerGuard: { lsp: true, strictNullChecks: true },
  ai: {
    defaultModel: "claude-3-7-sonnet",
    fallbackModel: "deepseek-v3",
    localProvider: "http://127.0.0.1:11434",
  },
}`,
  },
  "README.md": {
    lang: "markdown",
    code: `# Onyx Commercial AI IDE

High-Performance Commercial AI IDE Platform.
- Multi-Model Orchestration (Claude 3.7 Sonnet, DeepSeek V3, Gemini 2.0 Flash)
- In-Process LSP Compiler Guard
- Isolated Firecracker microVM Sandboxes
- Enterprise Dual-Licensing Ready`,
  },
}

type ModelInfo = {
  id: string
  name: string
  provider: string
  context: string
  badgeColor: string
  description: string
}

const AVAILABLE_MODELS: ModelInfo[] = [
  { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", provider: "Anthropic", context: "200k tokens", badgeColor: "#d97706", description: "Deep architectural reasoning, AST planning, and complex code generation." },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", context: "128k tokens", badgeColor: "#3b82f6", description: "High-throughput code synthesis and rapid multi-file refactoring." },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", context: "128k tokens", badgeColor: "#10b981", description: "Versatile multimodal coding, API design, and documentation." },
  { id: "gemini-2-flash", name: "Gemini 2.0 Flash", provider: "Google", context: "1M tokens", badgeColor: "#4ade80", description: "Ultra-low latency inference with massive 1-million-token context." },
  { id: "onyx-auto", name: "Onyx Auto-Router", provider: "Onyx Core", context: "Auto-Swarm", badgeColor: "#d8ff38", description: "Intelligent dynamic model dispatch based on AST complexity and budget." },
]

type AgentMessage = {
  id: string
  sender: "user" | "agent"
  content: string
  thinking?: string
  tools?: { name: string; output: string; status: "success" | "running" }[]
  timestamp: string
}

export function CloudAgentRoute() {
  const [activeFile, setActiveFile] = createSignal("src/auth/provider.ts")
  const [openTabs, setOpenTabs] = createSignal(["src/auth/provider.ts", "tests/auth.test.ts"])
  const [selectedModel, setSelectedModel] = createSignal<ModelInfo>(AVAILABLE_MODELS[0])
  const [modelDropdownOpen, setModelDropdownOpen] = createSignal(false)
  const [activeSidebarView, setActiveSidebarView] = createSignal<"explorer" | "search" | "git" | "security" | "settings">("explorer")
  const [searchQuery, setSearchQuery] = createSignal("")
  const [terminalOpen, setTerminalOpen] = createSignal(true)
  const [activeTerminalTab, setActiveTerminalTab] = createSignal<"bash" | "output" | "tests">("bash")
  const [promptInput, setPromptInput] = createSignal("")
  const [agentRunning, setAgentRunning] = createSignal(false)
  const [thinkingExpanded, setThinkingExpanded] = createSignal(true)

  const [messages, setMessages] = createSignal<AgentMessage[]>([
    {
      id: "m1",
      sender: "user",
      content: "Audit our auth layer, implement Google, GitHub, Claude, and Org SSO with JWT token rotation, and write automated test coverage.",
      timestamp: "11:42 AM",
    },
    {
      id: "m2",
      sender: "agent",
      thinking: "1. Examined src/auth/provider.ts - identified single-provider limitations.\n2. Injected OAuth2Client adapter for Google, GitHub, Claude, and SAML SSO.\n3. Implemented secure PKCE verification and rotateSessionToken() with 15m TTL.\n4. Added comprehensive test coverage in tests/auth.test.ts.",
      tools: [
        { name: "AST Analyzer", output: "Scanned 6 files · 0 syntax errors · 100% type safe", status: "success" },
        { name: "FileEdit: src/auth/provider.ts", output: "+48 lines · -12 lines", status: "success" },
        { name: "FileCreate: tests/auth.test.ts", output: "Created 28-line unit test suite", status: "success" },
        { name: "Run: bun test tests/auth.test.ts", output: "2 pass · 0 fail · 14.2ms execution", status: "success" },
      ],
      content: "I've refactored the auth layer to support Google, GitHub, Claude, and Organization SSO with automated token rotation and PKCE verification. All unit tests in `tests/auth.test.ts` are passing.",
      timestamp: "11:43 AM",
    },
  ])

  const [terminalLogs, setTerminalLogs] = createSignal([
    "onyx-cloud@vm-us-east-1:~/repo$ git status",
    "On branch main",
    "Changes to be committed:",
    "  modified: src/auth/provider.ts",
    "  new file: tests/auth.test.ts",
    "",
    "onyx-cloud@vm-us-east-1:~/repo$ bun test tests/auth.test.ts",
    "bun test v1.4.4 (x86_64-linux)",
    "",
    "tests/auth.test.ts:",
    "✓ OnyxAuthProvider - Multi-Provider SSO Suite > authenticates Google Workspace SSO tokens securely [1.42ms]",
    "✓ OnyxAuthProvider - Multi-Provider SSO Suite > rotates JWT tokens on GitHub OAuth handshake [0.89ms]",
    "",
    " 2 pass",
    " 0 fail",
    " Ran 2 tests across 1 file. [14.20ms]",
    "onyx-cloud@vm-us-east-1:~/repo$ _",
  ])

  function handleSendPrompt(e?: Event) {
    if (e) e.preventDefault()
    const text = promptInput().trim()
    if (!text || agentRunning()) return

    setPromptInput("")
    const userMsg: AgentMessage = {
      id: `m-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, userMsg])
    setAgentRunning(true)

    setTimeout(() => {
      const isTestCmd = text.includes("test")
      const agentMsg: AgentMessage = {
        id: `m-${Date.now() + 1}`,
        sender: "agent",
        thinking: `1. Analyzed command using ${selectedModel().name} engine.\n2. In-Process Compiler Guard verified AST integrity.\n3. Firecracker microVM isolated execution sandbox invoked.\n4. Synchronized worktree and verified test outputs.`,
        tools: [
          {
            name: isTestCmd ? "Run: bun test tests/auth.test.ts" : `Exec: ${text.slice(0, 30)}`,
            output: isTestCmd ? "2 pass · 0 fail (14.2ms)" : "Sandbox task completed with exit code 0",
            status: "success",
          },
        ],
        content: `Executed objective: "${text}". All changes have been compiled and verified by the LSP guard.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, agentMsg])
      setTerminalLogs((prev) => [
        ...prev,
        `onyx-cloud@vm-us-east-1:~/repo$ ${text}`,
        "✔ Command finished successfully [exit code 0]",
        "onyx-cloud@vm-us-east-1:~/repo$ _",
      ])
      setAgentRunning(false)
    }, 1200)
  }

  function openFile(path: string) {
    setActiveFile(path)
    if (!openTabs().includes(path)) {
      setOpenTabs((prev) => [...prev, path])
    }
  }

  function closeTab(path: string, e: MouseEvent) {
    e.stopPropagation()
    const newTabs = openTabs().filter((t) => t !== path)
    setOpenTabs(newTabs)
    if (activeFile() === path && newTabs.length > 0) {
      setActiveFile(newTabs[newTabs.length - 1])
    }
  }

  function runTestsNow() {
    setTerminalOpen(true)
    setActiveTerminalTab("tests")
    setTerminalLogs((prev) => [
      ...prev,
      "onyx-cloud@vm-us-east-1:~/repo$ bun test",
      "✓ tests/auth.test.ts (2 passed)",
      "✓ tests/agent.test.ts (4 passed)",
      "All 6 tests passing! [28.4ms]",
      "onyx-cloud@vm-us-east-1:~/repo$ _",
    ])
  }

  const currentContent = () => FILE_CONTENTS[activeFile()]?.code ?? "// File content loaded."
  const lineCount = () => currentContent().split("\n").length

  return (
    <div class="cloud-ide-root" onClick={() => setModelDropdownOpen(false)}>
      {/* ─── Top IDE Navigation Bar ─── */}
      <header class="cloud-ide-topbar" onClick={(e) => e.stopPropagation()}>
        <div class="cloud-ide-brand">
          <div class="cloud-ide-logo-dot" />
          <span class="cloud-ide-title">Onyx Cloud IDE</span>
          <span class="cloud-ide-chip">Autonomous Workbench</span>
        </div>

        <div class="cloud-ide-repo-pill">
          <span class="cloud-ide-icon">⎇</span>
          <span class="cloud-ide-repo-name">Manash8666/oynx</span>
          <span class="cloud-ide-branch">main</span>
          <span class="cloud-ide-vm-pill">
            <span class="cloud-ide-vm-dot" />
            Firecracker microVM: Online
          </span>
        </div>

        <div class="cloud-ide-actions">
          {/* Prominent Model Selector Dropdown */}
          <div class="cloud-ide-model-picker-container">
            <button
              type="button"
              class="cloud-ide-model-button"
              onClick={() => setModelDropdownOpen(!modelDropdownOpen())}
            >
              <span class="cloud-ide-model-dot" style={{ background: selectedModel().badgeColor }} />
              <span class="cloud-ide-model-current-name">{selectedModel().name}</span>
              <span class="cloud-ide-dropdown-arrow">{modelDropdownOpen() ? "▴" : "▾"}</span>
            </button>

            <Show when={modelDropdownOpen()}>
              <div class="cloud-ide-model-menu">
                <div class="cloud-ide-model-menu-title">SELECT INFERENCE MODEL</div>
                <For each={AVAILABLE_MODELS}>
                  {(model) => (
                    <button
                      type="button"
                      class={`cloud-ide-model-option ${selectedModel().id === model.id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedModel(model)
                        setModelDropdownOpen(false)
                      }}
                    >
                      <div class="cloud-ide-model-option-top">
                        <span class="cloud-ide-model-provider-badge" style={{ color: model.badgeColor, background: `${model.badgeColor}18` }}>
                          {model.provider}
                        </span>
                        <span class="cloud-ide-model-option-name">{model.name}</span>
                        <span class="cloud-ide-model-context-pill">{model.context}</span>
                        {selectedModel().id === model.id && <span class="cloud-ide-check">✓</span>}
                      </div>
                      <div class="cloud-ide-model-desc">{model.description}</div>
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>

          <button type="button" class="cloud-ide-run-btn" onClick={runTestsNow}>
            ▶ Run Tests
          </button>
          <a
            href="https://oynx.si"
            target="_blank"
            rel="noopener noreferrer"
            class="cloud-ide-preview-btn"
          >
            ↗ Preview :3000
          </a>
        </div>
      </header>

      {/* ─── Main 3-Column IDE Body ─── */}
      <div class="cloud-ide-body">
        {/* Leftmost Activity Bar */}
        <div class="cloud-ide-activity-bar">
          <button
            type="button"
            class={`cloud-ide-act-btn ${activeSidebarView() === "explorer" ? "active" : ""}`}
            title="File Explorer"
            onClick={() => setActiveSidebarView("explorer")}
          >
            📁
          </button>
          <button
            type="button"
            class={`cloud-ide-act-btn ${activeSidebarView() === "search" ? "active" : ""}`}
            title="Search Codebase"
            onClick={() => setActiveSidebarView("search")}
          >
            🔍
          </button>
          <button
            type="button"
            class={`cloud-ide-act-btn ${activeSidebarView() === "git" ? "active" : ""}`}
            title="Source Control"
            onClick={() => setActiveSidebarView("git")}
          >
            ⎇
          </button>
          <button
            type="button"
            class={`cloud-ide-act-btn ${activeSidebarView() === "security" ? "active" : ""}`}
            title="Security SAST"
            onClick={() => setActiveSidebarView("security")}
          >
            🛡️
          </button>
          <button
            type="button"
            class={`cloud-ide-act-btn ${activeSidebarView() === "settings" ? "active" : ""}`}
            title="IDE Preferences"
            onClick={() => setActiveSidebarView("settings")}
          >
            ⚙
          </button>
        </div>

        {/* Column 1: Collapsible Sidebar Views */}
        <aside class="cloud-ide-explorer">
          <Show when={activeSidebarView() === "explorer"}>
            <div class="cloud-ide-explorer-header">
              <span>EXPLORER</span>
              <span class="cloud-ide-explorer-repo">Onyx Core</span>
            </div>
            <div class="cloud-ide-tree">
              <div class="cloud-ide-tree-row folder">
                <span class="cloud-ide-arrow">▾</span>
                <span class="cloud-ide-folder-icon">📂</span>
                <span>src</span>
              </div>
              <div class="cloud-ide-sub-tree">
                <div class="cloud-ide-tree-row folder">
                  <span class="cloud-ide-arrow">▾</span>
                  <span class="cloud-ide-folder-icon">📁</span>
                  <span>auth</span>
                </div>
                <div class="cloud-ide-sub-tree">
                  <button
                    type="button"
                    class={`cloud-ide-tree-item ${activeFile() === "src/auth/provider.ts" ? "active" : ""}`}
                    onClick={() => openFile("src/auth/provider.ts")}
                  >
                    <span>📄 provider.ts</span>
                    <span class="cloud-ide-mod-dot">MOD</span>
                  </button>
                  <button
                    type="button"
                    class={`cloud-ide-tree-item ${activeFile() === "src/auth/session.ts" ? "active" : ""}`}
                    onClick={() => openFile("src/auth/session.ts")}
                  >
                    <span>📄 session.ts</span>
                  </button>
                  <button
                    type="button"
                    class={`cloud-ide-tree-item ${activeFile() === "src/auth/jwt.ts" ? "active" : ""}`}
                    onClick={() => openFile("src/auth/jwt.ts")}
                  >
                    <span>📄 jwt.ts</span>
                  </button>
                </div>

                <div class="cloud-ide-tree-row folder">
                  <span class="cloud-ide-arrow">▾</span>
                  <span class="cloud-ide-folder-icon">📁</span>
                  <span>agent</span>
                </div>
                <div class="cloud-ide-sub-tree">
                  <button
                    type="button"
                    class={`cloud-ide-tree-item ${activeFile() === "src/agent/orchestrator.ts" ? "active" : ""}`}
                    onClick={() => openFile("src/agent/orchestrator.ts")}
                  >
                    <span>📄 orchestrator.ts</span>
                  </button>
                  <button
                    type="button"
                    class={`cloud-ide-tree-item ${activeFile() === "src/agent/sandbox.ts" ? "active" : ""}`}
                    onClick={() => openFile("src/agent/sandbox.ts")}
                  >
                    <span>📄 sandbox.ts</span>
                  </button>
                  <button
                    type="button"
                    class={`cloud-ide-tree-item ${activeFile() === "src/agent/tools.ts" ? "active" : ""}`}
                    onClick={() => openFile("src/agent/tools.ts")}
                  >
                    <span>📄 tools.ts</span>
                  </button>
                </div>
              </div>

              <div class="cloud-ide-tree-row folder">
                <span class="cloud-ide-arrow">▾</span>
                <span class="cloud-ide-folder-icon">📂</span>
                <span>tests</span>
              </div>
              <div class="cloud-ide-sub-tree">
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "tests/auth.test.ts" ? "active" : ""}`}
                  onClick={() => openFile("tests/auth.test.ts")}
                >
                  <span>🧪 auth.test.ts</span>
                  <span class="cloud-ide-pass-dot">PASS</span>
                </button>
              </div>

              <div class="cloud-ide-file-flat-list">
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "package.json" ? "active" : ""}`}
                  onClick={() => openFile("package.json")}
                >
                  <span>📄 package.json</span>
                </button>
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "onyx.config.ts" ? "active" : ""}`}
                  onClick={() => openFile("onyx.config.ts")}
                >
                  <span>📄 onyx.config.ts</span>
                </button>
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "README.md" ? "active" : ""}`}
                  onClick={() => openFile("README.md")}
                >
                  <span>📄 README.md</span>
                </button>
              </div>
            </div>
          </Show>

          <Show when={activeSidebarView() === "search"}>
            <div class="cloud-ide-explorer-header">
              <span>SEARCH CODEBASE</span>
            </div>
            <div style="padding:0.75rem;">
              <input
                type="text"
                class="cloud-ide-search-box"
                placeholder="Find in files (e.g. OAuth2Client)..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
              />
              <div style="margin-top:0.75rem;font-size:0.75rem;color:var(--cloud-muted);">
                {searchQuery() ? `Found 3 matches for "${searchQuery()}" across 2 files` : "Type to search AST symbol graph"}
              </div>
            </div>
          </Show>

          <Show when={activeSidebarView() === "git"}>
            <div class="cloud-ide-explorer-header">
              <span>SOURCE CONTROL</span>
              <span class="cloud-ide-explorer-repo">Git: main</span>
            </div>
            <div style="padding:0.75rem;font-size:0.75rem;color:#e2e8f0;">
              <div style="font-weight:700;margin-bottom:0.5rem;color:var(--cloud-muted);">STAGED CHANGES (2)</div>
              <div class="cloud-ide-git-row">
                <span style="color:#4ade80;">M</span>
                <span>src/auth/provider.ts</span>
              </div>
              <div class="cloud-ide-git-row">
                <span style="color:#22c55e;">A</span>
                <span>tests/auth.test.ts</span>
              </div>
              <button
                type="button"
                class="cloud-ide-commit-btn"
                onClick={() => {
                  setTerminalOpen(true)
                  setTerminalLogs((p) => [...p, "git commit -m 'feat(auth): add multi-provider SSO' [main a552cfe]", "Committed successfully"])
                }}
              >
                Commit &amp; Push to Origin
              </button>
            </div>
          </Show>

          <Show when={activeSidebarView() === "security"}>
            <div class="cloud-ide-explorer-header">
              <span>SECURITY SAST</span>
              <span style="color:#4ade80;">0 VULNS</span>
            </div>
            <div style="padding:0.75rem;font-size:0.75rem;color:#94a3b8;line-height:1.6;">
              <div style="color:#4ade80;font-weight:700;">✓ In-Process Guard Active</div>
              <div>- AST Vulnerability Check: Clean</div>
              <div>- Secret Leak Scanner: Clean</div>
              <div>- Dependency Audit: 0 High CVEs</div>
            </div>
          </Show>

          <Show when={activeSidebarView() === "settings"}>
            <div class="cloud-ide-explorer-header">
              <span>IDE PREFERENCES</span>
            </div>
            <div style="padding:0.75rem;font-size:0.75rem;color:#cbd5e1;display:flex;flex-direction:column;gap:0.75rem;">
              <div>Editor Font: JetBrains Mono</div>
              <div>Vim Mode: Disabled</div>
              <div>Compiler Guard: TypeScript 5.8 Strict</div>
              <div>Auto-Save: Instant (Cloud Memory)</div>
            </div>
          </Show>
        </aside>

        {/* Column 2: Code Workbench (Editor + Terminal) */}
        <section class="cloud-ide-editor-area">
          {/* Tab Bar */}
          <div class="cloud-ide-tabs">
            <For each={openTabs()}>
              {(tab) => (
                <div
                  class={`cloud-ide-tab ${activeFile() === tab ? "active" : ""}`}
                  onClick={() => setActiveFile(tab)}
                >
                  <span class="cloud-ide-tab-icon">{tab.endsWith(".test.ts") ? "🧪" : "📄"}</span>
                  <span class="cloud-ide-tab-title">{tab.split("/").pop()}</span>
                  <button type="button" class="cloud-ide-tab-close" onClick={(e) => closeTab(tab, e)}>✕</button>
                </div>
              )}
            </For>
          </div>

          {/* Breadcrumb */}
          <div class="cloud-ide-breadcrumbs">
            <span>oynx</span>
            <span>›</span>
            <span>{activeFile().split("/").slice(0, -1).join(" › ")}</span>
            <span>›</span>
            <span class="cloud-ide-crumb-active">{activeFile().split("/").pop()}</span>
          </div>

          {/* Code Editor View */}
          <div class="cloud-ide-editor-view">
            <div class="cloud-ide-line-numbers">
              {Array.from({ length: Math.max(30, lineCount()) }, (_, i) => (
                <div>{i + 1}</div>
              ))}
            </div>
            <pre class="cloud-ide-code-pre">
              <code>{currentContent()}</code>
            </pre>
          </div>

          {/* Bottom Integrated Terminal */}
          <div class={`cloud-ide-terminal-pane ${terminalOpen() ? "open" : "collapsed"}`}>
            <div class="cloud-ide-term-header">
              <div class="cloud-ide-term-tabs">
                <button
                  type="button"
                  class={`cloud-ide-term-tab ${activeTerminalTab() === "bash" ? "active" : ""}`}
                  onClick={() => setActiveTerminalTab("bash")}
                >
                  Bash Terminal
                </button>
                <button
                  type="button"
                  class={`cloud-ide-term-tab ${activeTerminalTab() === "tests" ? "active" : ""}`}
                  onClick={() => setActiveTerminalTab("tests")}
                >
                  Bun Tests (6 passed)
                </button>
                <button
                  type="button"
                  class={`cloud-ide-term-tab ${activeTerminalTab() === "output" ? "active" : ""}`}
                  onClick={() => setActiveTerminalTab("output")}
                >
                  Cloud VM Logs
                </button>
              </div>
              <div class="cloud-ide-term-controls">
                <button
                  type="button"
                  class="cloud-ide-term-toggle"
                  onClick={() => setTerminalOpen(!terminalOpen())}
                >
                  {terminalOpen() ? "▾ Hide Terminal" : "▴ Show Terminal"}
                </button>
              </div>
            </div>
            <Show when={terminalOpen()}>
              <div class="cloud-ide-term-output">
                <For each={terminalLogs()}>
                  {(log) => <div class="cloud-ide-term-line">{log}</div>}
                </For>
              </div>
            </Show>
          </div>
        </section>

        {/* Column 3: Autonomous Agent Stream */}
        <aside class="cloud-ide-agent-stream">
          <div class="cloud-ide-agent-header">
            <div class="cloud-ide-agent-status">
              <span class="cloud-ide-agent-pulse" />
              <div>
                <div class="cloud-ide-agent-name">Onyx Autonomous Agent</div>
                <div class="cloud-ide-agent-tokens">Engine: {selectedModel().name} · 14.2 tok/s</div>
              </div>
            </div>
            <span class="cloud-ide-agent-model-tag" style={{ color: selectedModel().badgeColor, border: `1px solid ${selectedModel().badgeColor}40` }}>
              {selectedModel().provider}
            </span>
          </div>

          {/* Conversation & Tool Calls */}
          <div class="cloud-ide-agent-messages">
            <For each={messages()}>
              {(msg) => (
                <div class={`cloud-ide-message ${msg.sender}`}>
                  <div class="cloud-ide-msg-header">
                    <span class="cloud-ide-msg-sender">{msg.sender === "user" ? "You" : "Onyx Agent"}</span>
                    <span class="cloud-ide-msg-time">{msg.timestamp}</span>
                  </div>

                  {/* Thinking Accordion */}
                  <Show when={msg.thinking}>
                    <div class="cloud-ide-thinking-block">
                      <div
                        class="cloud-ide-thinking-header"
                        onClick={() => setThinkingExpanded(!thinkingExpanded())}
                      >
                        <span>🧠 Thought for 4.2 seconds</span>
                        <span class="cloud-ide-chevron">{thinkingExpanded() ? "▾" : "▸"}</span>
                      </div>
                      <Show when={thinkingExpanded()}>
                        <div class="cloud-ide-thinking-content">{msg.thinking}</div>
                      </Show>
                    </div>
                  </Show>

                  {/* Tool Invocations */}
                  <Show when={msg.tools}>
                    <div class="cloud-ide-tools-list">
                      <For each={msg.tools}>
                        {(tool) => (
                          <div class="cloud-ide-tool-card">
                            <div class="cloud-ide-tool-top">
                              <span class="cloud-ide-tool-icon">⚡</span>
                              <span class="cloud-ide-tool-name">{tool.name}</span>
                              <span class="cloud-ide-tool-badge">Done</span>
                            </div>
                            <div class="cloud-ide-tool-out">{tool.output}</div>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>

                  <div class="cloud-ide-msg-body">{msg.content}</div>
                </div>
              )}
            </For>

            <Show when={agentRunning()}>
              <div class="cloud-ide-agent-loading">
                <span class="cloud-ide-spinner-sm" />
                <span>Onyx Agent is synthesizing AST and executing tools with {selectedModel().name}...</span>
              </div>
            </Show>
          </div>

          {/* Prompt Input Box */}
          <form onSubmit={handleSendPrompt} class="cloud-ide-prompt-form">
            <div class="cloud-ide-command-chips">
              <button
                type="button"
                class="cloud-ide-chip-btn"
                onClick={() => {
                  setPromptInput("bun test tests/auth.test.ts")
                  handleSendPrompt()
                }}
              >
                /test
              </button>
              <button
                type="button"
                class="cloud-ide-chip-btn"
                onClick={() => {
                  setPromptInput("git diff src/auth/provider.ts")
                  handleSendPrompt()
                }}
              >
                /diff
              </button>
              <button
                type="button"
                class="cloud-ide-chip-btn"
                onClick={() => {
                  setPromptInput("git commit -m 'feat: update auth session rotation'")
                  handleSendPrompt()
                }}
              >
                /commit
              </button>
              <button
                type="button"
                class="cloud-ide-chip-btn"
                onClick={() => {
                  setPromptInput("Review AST architecture of src/auth")
                  handleSendPrompt()
                }}
              >
                /review
              </button>
            </div>
            <div class="cloud-ide-input-box">
              <textarea
                class="cloud-ide-prompt-textarea"
                rows={3}
                value={promptInput()}
                onInput={(e) => setPromptInput(e.currentTarget.value)}
                placeholder={`Ask Onyx Agent (${selectedModel().name}) or type instructions (/test, /review, fix bugs)...`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendPrompt()
                  }
                }}
              />
              <div class="cloud-ide-input-bottom">
                <span class="cloud-ide-kbd-hint">Press ↵ to send · Shift+↵ for newline</span>
                <button
                  type="submit"
                  class="cloud-ide-send-btn"
                  disabled={!promptInput().trim() || agentRunning()}
                >
                  ⚡ Send
                </button>
              </div>
            </div>
          </form>
        </aside>
      </div>
    </div>
  )
}
