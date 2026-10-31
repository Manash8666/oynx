import { createSignal, For, Show } from "solid-js"

type FileItem = {
  name: string
  path: string
  type: "file" | "folder"
  isOpen?: boolean
  modified?: boolean
  children?: FileItem[]
}

const INITIAL_FILES: FileItem[] = [
  {
    name: "src",
    path: "src",
    type: "folder",
    isOpen: true,
    children: [
      {
        name: "auth",
        path: "src/auth",
        type: "folder",
        isOpen: true,
        children: [
          { name: "provider.ts", path: "src/auth/provider.ts", type: "file", modified: true },
          { name: "session.ts", path: "src/auth/session.ts", type: "file" },
          { name: "jwt.ts", path: "src/auth/jwt.ts", type: "file" },
        ],
      },
      {
        name: "agent",
        path: "src/agent",
        type: "folder",
        isOpen: false,
        children: [
          { name: "orchestrator.ts", path: "src/agent/orchestrator.ts", type: "file" },
          { name: "sandbox.ts", path: "src/agent/sandbox.ts", type: "file" },
          { name: "tools.ts", path: "src/agent/tools.ts", type: "file" },
        ],
      },
      {
        name: "server",
        path: "src/server",
        type: "folder",
        isOpen: false,
        children: [
          { name: "router.ts", path: "src/server/router.ts", type: "file" },
          { name: "index.ts", path: "src/server/index.ts", type: "file" },
        ],
      },
    ],
  },
  {
    name: "tests",
    path: "tests",
    type: "folder",
    isOpen: true,
    children: [
      { name: "auth.test.ts", path: "tests/auth.test.ts", type: "file", modified: true },
      { name: "agent.test.ts", path: "tests/agent.test.ts", type: "file" },
    ],
  },
  { name: "package.json", path: "package.json", type: "file" },
  { name: "onyx.config.ts", path: "onyx.config.ts", type: "file" },
  { name: "README.md", path: "README.md", type: "file" },
]

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
    // Verified by Onyx Security Gate
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
  "name": "@onyx/cloud-runtime",
  "version": "2.4.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@onyx/auth-sdk": "workspace:*",
    "@onyx/agent-core": "workspace:*",
    "bun": "^1.4.4"
  }
}`,
  },
}

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
  const [activeModel, setActiveModel] = createSignal("Claude 3.7 Sonnet")
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

  function handleSendPrompt(e: Event) {
    e.preventDefault()
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

    // Simulate agent workflow
    setTimeout(() => {
      const agentMsg: AgentMessage = {
        id: `m-${Date.now() + 1}`,
        sender: "agent",
        thinking: `1. Analyzed request: "${text}"\n2. Querying AST dependency graph for target symbols...\n3. Executing isolated microVM sandbox command...\n4. Validating diff against test gates.`,
        tools: [
          { name: `Run: ${text.startsWith("/") ? text.slice(1) : "bun test"}`, output: "Executed successfully in Firecracker microVM (0.8s)", status: "success" },
        ],
        content: `Completed objective: "${text}". Code modifications verified and preview environment synchronized.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, agentMsg])
      setTerminalLogs((prev) => [
        ...prev,
        `onyx-cloud@vm-us-east-1:~/repo$ # Executed: ${text}`,
        "✔ Command finished successfully [exit code 0]",
        "onyx-cloud@vm-us-east-1:~/repo$ _",
      ])
      setAgentRunning(false)
    }, 1800)
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

  const currentContent = () => FILE_CONTENTS[activeFile()]?.code ?? "// File is empty or binary preview."

  return (
    <div class="cloud-ide-root">
      {/* ─── Top IDE Navigation Bar ─── */}
      <header class="cloud-ide-topbar">
        <div class="cloud-ide-brand">
          <div class="cloud-ide-logo-dot" />
          <span class="cloud-ide-title">Onyx Cloud IDE</span>
          <span class="cloud-ide-chip">Claude Code Workbench</span>
        </div>

        <div class="cloud-ide-repo-pill">
          <span class="cloud-ide-icon">⎇</span>
          <span class="cloud-ide-repo-name">Manash8666/oynx</span>
          <span class="cloud-ide-branch">main</span>
          <span class="cloud-ide-vm-pill">
            <span class="cloud-ide-vm-dot" />
            Firecracker microVM
          </span>
        </div>

        <div class="cloud-ide-actions">
          <div class="cloud-ide-model-select-wrap">
            <span class="cloud-ide-model-spark">✦</span>
            <select
              class="cloud-ide-model-select"
              value={activeModel()}
              onChange={(e) => setActiveModel(e.currentTarget.value)}
            >
              <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
              <option value="DeepSeek V3">DeepSeek V3</option>
              <option value="Onyx Auto">Onyx Auto-Router</option>
            </select>
          </div>
          <button type="button" class="cloud-ide-run-btn" onClick={() => setActiveTerminalTab("tests")}>
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
          <button type="button" class="cloud-ide-act-btn active" title="Explorer">📁</button>
          <button type="button" class="cloud-ide-act-btn" title="Search (⌘F)">🔍</button>
          <button type="button" class="cloud-ide-act-btn" title="Source Control">⎇</button>
          <button type="button" class="cloud-ide-act-btn" title="Security SAST">🛡️</button>
          <button type="button" class="cloud-ide-act-btn" title="Settings">⚙</button>
        </div>

        {/* Column 1: File Explorer */}
        <aside class="cloud-ide-explorer">
          <div class="cloud-ide-explorer-header">
            <span>EXPLORER</span>
            <span class="cloud-ide-explorer-repo">Onyx Core</span>
          </div>
          <div class="cloud-ide-tree">
            <For each={INITIAL_FILES}>
              {(item) => (
                <div>
                  <div class="cloud-ide-tree-row folder">
                    <span class="cloud-ide-arrow">▾</span>
                    <span class="cloud-ide-folder-icon">📂</span>
                    <span>{item.name}</span>
                  </div>
                  <Show when={item.children}>
                    <div class="cloud-ide-sub-tree">
                      <For each={item.children}>
                        {(child) => (
                          <div>
                            {child.type === "folder" ? (
                              <div>
                                <div class="cloud-ide-tree-row folder">
                                  <span class="cloud-ide-arrow">▾</span>
                                  <span class="cloud-ide-folder-icon">📁</span>
                                  <span>{child.name}</span>
                                </div>
                                <Show when={child.children}>
                                  <div class="cloud-ide-sub-tree">
                                    <For each={child.children}>
                                      {(file) => (
                                        <div
                                          class={`cloud-ide-tree-row file ${activeFile() === file.path ? "active" : ""}`}
                                          onClick={() => openFile(file.path)}
                                        >
                                          <span class="cloud-ide-file-icon">📄</span>
                                          <span class="cloud-ide-file-name">{file.name}</span>
                                          {file.modified && <span class="cloud-ide-mod-dot">●</span>}
                                        </div>
                                      )}
                                    </For>
                                  </div>
                                </Show>
                              </div>
                            ) : (
                              <div
                                class={`cloud-ide-tree-row file ${activeFile() === child.path ? "active" : ""}`}
                                onClick={() => openFile(child.path)}
                              >
                                <span class="cloud-ide-file-icon">🧪</span>
                                <span class="cloud-ide-file-name">{child.name}</span>
                                {child.modified && <span class="cloud-ide-mod-dot">●</span>}
                              </div>
                            )}
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
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
              {Array.from({ length: 32 }, (_, i) => (
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
                  Bun Tests (2 passed)
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

        {/* Column 3: Claude Code Autonomous Agent Stream */}
        <aside class="cloud-ide-agent-stream">
          <div class="cloud-ide-agent-header">
            <div class="cloud-ide-agent-status">
              <span class="cloud-ide-agent-pulse" />
              <div>
                <div class="cloud-ide-agent-name">Onyx Agent (Claude Code Core)</div>
                <div class="cloud-ide-agent-tokens">142k / 200k tokens · 14.2 tok/s</div>
              </div>
            </div>
            <span class="cloud-ide-agent-model-tag">{activeModel()}</span>
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
                <span>Onyx Agent is synthesizing AST and executing tools...</span>
              </div>
            </Show>
          </div>

          {/* Prompt Input Box (Claude Code Style) */}
          <form onSubmit={handleSendPrompt} class="cloud-ide-prompt-form">
            <div class="cloud-ide-command-chips">
              <button type="button" class="cloud-ide-chip-btn" onClick={() => setPromptInput("/test tests/auth.test.ts")}>
                /test
              </button>
              <button type="button" class="cloud-ide-chip-btn" onClick={() => setPromptInput("/diff")}>
                /diff
              </button>
              <button type="button" class="cloud-ide-chip-btn" onClick={() => setPromptInput("/commit")}>
                /commit
              </button>
              <button type="button" class="cloud-ide-chip-btn" onClick={() => setPromptInput("/review")}>
                /review
              </button>
            </div>
            <div class="cloud-ide-input-box">
              <textarea
                class="cloud-ide-prompt-textarea"
                rows={3}
                value={promptInput()}
                onInput={(e) => setPromptInput(e.currentTarget.value)}
                placeholder="Ask Onyx Agent or enter instructions (e.g. /test, /review, fix bugs)..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendPrompt(e)
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
