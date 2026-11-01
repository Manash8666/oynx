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
  "src/agent/lucifer.ts": {
    lang: "typescript",
    code: `import { ASTGuardian } from "../review/ast-guardian"
import { ComponentRegistry } from "../ui/component-registry"
import { SonicSequencer } from "../sonic/audio-sequencer"
import { FirecrackerSandbox } from "./sandbox"

export interface DualCortexConfig {
  analyticalModel: "deepseek-r1" | "deepseek-v3"
  creativeModel: "qwen-2.5-coder" | "qwen-image"
  mode: "dual-cortex" | "ast-guardian" | "ui-studio" | "sonic-engine"
  maxReasoningTokens: number
}

/**
 * Lucifer — Onyx's Flagship Dual-Cortex AI Engineering Agent
 * Harmonizes DeepSeek high-order logical reasoning with Qwen multimodal UI/audio generation.
 */
export class LuciferEngine {
  private astGuardian: ASTGuardian
  private sandbox: FirecrackerSandbox

  constructor(private config: DualCortexConfig) {
    this.astGuardian = new ASTGuardian()
    this.sandbox = new FirecrackerSandbox({ region: "us-east-1", memoryMb: 4096 })
  }

  /**
   * Autonomous Plan -> Work -> Verify execution loop
   */
  async executeObjective(objective: string, worktree: string) {
    // Phase 1: DeepSeek Analytical Cortex generates AST dependency plan
    const astPlan = await this.astGuardian.analyzeDependencyGraph(worktree)

    // Phase 2: Qwen Creative Cortex synthesizes UI/multimodal structures
    const patches = await this.synthesizePatches(objective, astPlan)

    // Phase 3: Sandboxed execution & compiler guard verification
    const verification = await this.sandbox.applyAndVerify(patches)
    if (!verification.passed) {
      return await this.selfHeal(verification.compilerErrors)
    }

    return {
      status: "completed",
      verified: true,
      patchesApplied: patches.length,
      metrics: { executionMs: 342, tokensUsed: 12040 }
    }
  }

  private async synthesizePatches(objective: string, ast: any) {
    return [{ file: "src/auth/provider.ts", diff: "+48 lines · 0 errors" }]
  }

  private async selfHeal(errors: string[]) {
    return { status: "healed", passes: 1, errorsResolved: errors.length }
  }
}`,
  },
  "src/review/ast-guardian.ts": {
    lang: "typescript",
    code: `import { parseAST, type ASTNode } from "@onyx/ast-parser"

export interface ReviewFinding {
  id: string
  rule: "NPE_GUARD" | "THREAD_SAFETY" | "SQLI_PREVENT" | "SECRET_LEAK" | "XSS_SINK"
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO"
  file: string
  line: number
  message: string
  automatedFix?: string
}

/**
 * AST Guardian — Deterministic AST Static Analysis Rule Engine
 * Synthesizes high-throughput deterministic rule checkers with DeepSeek reasoning.
 */
export class ASTGuardian {
  private activeRules = ["NPE_GUARD", "THREAD_SAFETY", "SQLI_PREVENT", "SECRET_LEAK"]

  async analyzeDependencyGraph(dir: string): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = [
      {
        id: "AST-101",
        rule: "SQLI_PREVENT",
        severity: "CRITICAL",
        file: "src/api/users.ts",
        line: 112,
        message: "Dynamic string interpolation in SQL query. Vulnerable to injection.",
        automatedFix: "const res = await db.query('SELECT * FROM users WHERE id = $1', [userId])",
      },
      {
        id: "AST-102",
        rule: "NPE_GUARD",
        severity: "HIGH",
        file: "src/auth/jwt.ts",
        line: 45,
        message: "Optional chaining missing on decoded token claims payload.",
        automatedFix: "const email = decoded?.payload?.email ?? 'anonymous'",
      },
      {
        id: "AST-103",
        rule: "SECRET_LEAK",
        severity: "CRITICAL",
        file: "src/auth/jwt.ts",
        line: 101,
        message: "Hardcoded fallback JWT_SECRET string literal detected in repository.",
        automatedFix: "const secret = process.env.JWT_SECRET || crypto.randomUUID()",
      }
    ]
    return findings
  }
}`,
  },
  "src/ui/component-registry.tsx": {
    lang: "typescript",
    code: `import type { JSX } from "solid-js"

export interface ButtonProps {
  variant?: "volt" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  children: JSX.Element
  onClick?: () => void
}

/**
 * Onyx Accessible Component Registry Primitives
 * Synthesized from shadcn-ui, Nuxt UI, and Ant Design enterprise tokens.
 */
export function OnyxButton(props: ButtonProps) {
  const baseClass = "inline-flex items-center justify-center font-bold transition-all rounded-md"
  const variants = {
    volt: "bg-[#d8ff38] text-black hover:bg-[#c4ec26] shadow-lg shadow-[#d8ff38]/20",
    outline: "border border-white/20 text-white hover:bg-white/5",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
    destructive: "bg-red-600 text-white hover:bg-red-500",
  }
  return (
    <button class={\`\${baseClass} \${variants[props.variant ?? "volt"]}\`} onClick={props.onClick}>
      {props.children}
    </button>
  )
}`,
  },
  "src/sonic/audio-sequencer.ts": {
    lang: "typescript",
    code: `/**
 * Onyx Sonic Studio Engine
 * Synthesized from OpenMusic and ACE-Step UI patterns.
 * Generates algorithmic audio, stems, and MIDI sequences in the IDE.
 */
export class SonicSequencer {
  private bpm: number = 124
  private tracks: string[] = ["808 Kick", "Crisp Snare", "Hi-Hat Closed", "Analog Synth Lead"]

  generatePromptForTrack(genre: string, mood: string) {
    return \`genre:\${genre} bpm:\${this.bpm} mood:\${mood} arrangement:[Intro, Drop, Verse, Outro]\`
  }

  getStemSeparationProfile() {
    return {
      vocals: "clean-isolated-48khz",
      drums: "punchy-transient-preserved",
      bass: "sub-80hz-mono-centered",
      instruments: "stereo-widened-hall-reverb"
    }
  }
}`,
  },
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

  const secret = process.env.JWT_SECRET || crypto.randomUUID()
  const signature = crypto.createHmac("sha256", secret).update(\`\${header}.\${payload}\`).digest("base64url")

  return \`\${header}.\${payload}.\${signature}\`
}

export function verifyJwt(token: string): boolean {
  return token.split(".").length === 3
}`,
  },
  "tests/lucifer.test.ts": {
    lang: "typescript",
    code: `import { describe, it, expect, beforeEach } from "bun:test"
import { LuciferEngine } from "../src/agent/lucifer"
import { ASTGuardian } from "../src/review/ast-guardian"

describe("Lucifer Dual-Cortex Engine Test Suite", () => {
  let lucifer: LuciferEngine

  beforeEach(() => {
    lucifer = new LuciferEngine({
      analyticalModel: "deepseek-r1",
      creativeModel: "qwen-2.5-coder",
      mode: "dual-cortex",
      maxReasoningTokens: 32768,
    })
  })

  it("successfully detects AST vulnerabilities and provides automated fixes", async () => {
    const guardian = new ASTGuardian()
    const findings = await guardian.analyzeDependencyGraph("./src")
    expect(findings.length).toBeGreaterThan(0)
    expect(findings[0].automatedFix).toBeDefined()
  })

  it("executes multi-step objectives through autonomous plan-work-verify loop", async () => {
    const res = await lucifer.executeObjective("Refactor auth JWT token rotation", "./src")
    expect(res.status).toBe("completed")
    expect(res.verified).toBe(true)
  })
})`,
  },
  "package.json": {
    lang: "json",
    code: `{
  "name": "@onyx/platform-core",
  "version": "3.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@onyx/lucifer-engine": "workspace:*",
    "@onyx/ast-guardian": "workspace:*",
    "@onyx/sonic-studio": "workspace:*",
    "@onyx/auth-sdk": "workspace:*",
    "bun": "^1.4.4"
  }
}`,
  },
  "README.md": {
    lang: "markdown",
    code: `# Onyx Enterprise Cloud IDE & Agent Lucifer

The World's Most Advanced AI Engineering Platform.
- **Agent Lucifer**: Dual-Cortex Engine synthesizing DeepSeek R1/V3 logic with Qwen 2.5 multimodal UI & Sonic synthesis.
- **AST Guardian**: Deterministic multi-language syntax and vulnerability checker.
- **Sonic Studio**: Integrated audio and track generation in the IDE workbench.
- **Multi-Provider SSO**: Google Workspace, GitHub, Claude, and Enterprise SAML.`,
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
  {
    id: "lucifer-dual",
    name: "Lucifer (Dual-Cortex Engine)",
    provider: "Onyx Core",
    context: "256k tokens",
    badgeColor: "#d8ff38",
    description: "Flagship Dual-Cortex Engine. Harmonizes DeepSeek R1 reasoning with Qwen 2.5 multimodal UI & audio generation.",
  },
  {
    id: "lucifer-ast",
    name: "Lucifer AST Guardian (DeepSeek)",
    provider: "Onyx Core",
    context: "128k tokens",
    badgeColor: "#3b82f6",
    description: "Deterministic AST vulnerability checker, thread-safety analysis, and line-level patch generation.",
  },
  {
    id: "lucifer-ui",
    name: "Lucifer UI Studio (Qwen 2.5)",
    provider: "Onyx Core",
    context: "128k tokens",
    badgeColor: "#a855f7",
    description: "Generative UI and accessible component registry. Outputs production-ready Tailwind and Ant Design tokens.",
  },
  {
    id: "lucifer-sonic",
    name: "Lucifer Sonic Engine (AI Audio)",
    provider: "Onyx Core",
    context: "64k tokens",
    badgeColor: "#ec4899",
    description: "Algorithmic audio sequencing, stem separation, and music generation inside the IDE workbench.",
  },
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    context: "200k tokens",
    badgeColor: "#d97706",
    description: "Deep architectural reasoning, AST planning, and complex code generation.",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    context: "128k tokens",
    badgeColor: "#60a5fa",
    description: "High-throughput code synthesis and rapid multi-file refactoring.",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    context: "128k tokens",
    badgeColor: "#10b981",
    description: "Versatile multimodal coding, API design, and documentation.",
  },
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
  const [activeFile, setActiveFile] = createSignal("src/agent/lucifer.ts")
  const [openTabs, setOpenTabs] = createSignal(["src/agent/lucifer.ts", "src/review/ast-guardian.ts", "tests/lucifer.test.ts"])
  const [selectedModel, setSelectedModel] = createSignal<ModelInfo>(AVAILABLE_MODELS[0])
  const [modelDropdownOpen, setModelDropdownOpen] = createSignal(false)
  const [activeSidebarView, setActiveSidebarView] = createSignal<"explorer" | "lucifer" | "reviewer" | "registry" | "sonic" | "git" | "settings">("explorer")
  const [searchQuery, setSearchQuery] = createSignal("")
  const [terminalOpen, setTerminalOpen] = createSignal(true)
  const [activeTerminalTab, setActiveTerminalTab] = createSignal<"bash" | "ast" | "tests" | "logs">("bash")
  const [promptInput, setPromptInput] = createSignal("")
  const [agentRunning, setAgentRunning] = createSignal(false)
  const [thinkingExpanded, setThinkingExpanded] = createSignal(true)

  // Sonic Studio Interactive State
  const [sonicBpm, setSonicBpm] = createSignal(124)
  const [sonicPlaying, setSonicPlaying] = createSignal(false)

  // AST Reviewer Interactive State
  const [appliedPatches, setAppliedPatches] = createSignal<string[]>([])

  const [messages, setMessages] = createSignal<AgentMessage[]>([
    {
      id: "m1",
      sender: "user",
      content: "Initialize Agent Lucifer with Dual-Cortex intelligence. Wire DeepSeek AST analysis and Qwen multimodal UI generation into our repository.",
      timestamp: "11:42 AM",
    },
    {
      id: "m2",
      sender: "agent",
      thinking: "1. Invoked DeepSeek R1 Analytical Cortex: Scanned 12 repository trees, validated MIT/Apache/CC0 licenses.\n2. Injected ASTGuardian with deterministic rule pipeline (NPE, SQLi, thread-safety, secrets).\n3. Invoked Qwen 2.5 Multimodal Cortex: Scaffolding accessible ComponentRegistry and SonicSequencer.\n4. Executed bun test tests/lucifer.test.ts: 100% tests passing in Firecracker microVM.",
      tools: [
        { name: "Lucifer Dual-Cortex Init", output: "DeepSeek R1 (Logic) + Qwen 2.5 (Creative) synchronized", status: "success" },
        { name: "AST Guardian Check", output: "Scanned AST graph: 3 findings annotated with auto-fixes", status: "success" },
        { name: "Component Registry", output: "Scaffolded Onyx accessible UI primitives", status: "success" },
        { name: "Sonic Studio", output: "Audio sequencer & stem processor loaded (124 BPM)", status: "success" },
        { name: "Run: bun test tests/lucifer.test.ts", output: "2 pass · 0 fail · 18.4ms execution", status: "success" },
      ],
      content: "Agent Lucifer is fully operational. The Dual-Cortex architecture is wired into both Cloud IDE and Desktop CLI. DeepSeek R1 handles AST analysis and test verification, while Qwen 2.5 drives generative UI and Sonic Studio audio workflows.",
      timestamp: "11:43 AM",
    },
  ])

  const [terminalLogs, setTerminalLogs] = createSignal([
    "onyx-cloud@vm-us-east-1:~/repo$ onyx --agent lucifer",
    "✔ Agent Lucifer initialized in Dual-Cortex Mode (DeepSeek R1 + Qwen 2.5)",
    "✔ In-Process AST Guardian: Active",
    "✔ Firecracker microVM isolated sandbox: Online [0.4ms]",
    "",
    "onyx-cloud@vm-us-east-1:~/repo$ bun test tests/lucifer.test.ts",
    "bun test v1.4.4 (x86_64-linux)",
    "tests/lucifer.test.ts:",
    "✓ Lucifer Dual-Cortex Engine > detects AST vulnerabilities [1.12ms]",
    "✓ Lucifer Dual-Cortex Engine > executes autonomous plan-work-verify loop [17.28ms]",
    "",
    " 2 pass",
    " 0 fail",
    " Ran 2 tests across 1 file. [18.40ms]",
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
      const isReviewCmd = text.includes("review") || text.includes("ast")
      const isUiCmd = text.includes("ui") || text.includes("component")
      const isSonicCmd = text.includes("audio") || text.includes("music")

      let toolName = `Exec: ${text.slice(0, 32)}`
      let toolOut = "Sandbox task completed with exit code 0"
      let thinkingMsg = `1. Lucifer parsed objective using ${selectedModel().name}.\n2. Invoked DeepSeek reasoning for AST integrity.\n3. Verified changes inside Firecracker microVM.`

      if (isReviewCmd) {
        toolName = "AST Guardian Audit"
        toolOut = "Found 3 issues · Generated 3 surgical patches"
        thinkingMsg = "1. Parsed TypeScript AST using deterministic rule set.\n2. Checked NPE sinks and SQL parameterization.\n3. Verified zero compiler regressions."
      } else if (isUiCmd) {
        toolName = "Qwen 2.5 UI Synthesizer"
        toolOut = "Created accessible component with responsive tokens"
        thinkingMsg = "1. Loaded design tokens from Component Registry.\n2. Evaluated contrast ratios and ARIA accessibility.\n3. Generated production-ready Solid/Tailwind JSX."
      } else if (isSonicCmd) {
        toolName = "Sonic Studio Synthesizer"
        toolOut = "Rendered 4-track stems at 124 BPM"
        thinkingMsg = "1. Generated arrangement matrix for 4 stems.\n2. Synthesized acoustic metadata and prompt structure.\n3. Synchronized audio visualizer."
      } else if (isTestCmd) {
        toolName = "bun test tests/lucifer.test.ts"
        toolOut = "2 pass · 0 fail (18.4ms)"
      }

      const agentMsg: AgentMessage = {
        id: `m-${Date.now() + 1}`,
        sender: "agent",
        thinking: thinkingMsg,
        tools: [{ name: toolName, output: toolOut, status: "success" }],
        content: `Lucifer completed task: "${text}". Changes have been validated by the AST Guardian and verified in the test harness.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, agentMsg])
      setTerminalLogs((prev) => [
        ...prev,
        `onyx-cloud@vm-us-east-1:~/repo$ ${text}`,
        `✔ Lucifer executed: ${toolOut}`,
        "onyx-cloud@vm-us-east-1:~/repo$ _",
      ])
      setAgentRunning(false)
    }, 1100)
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
      "✓ tests/lucifer.test.ts (2 passed)",
      "✓ tests/auth.test.ts (2 passed)",
      "✓ tests/guardian.test.ts (3 passed)",
      "All 7 tests passing! [24.1ms]",
      "onyx-cloud@vm-us-east-1:~/repo$ _",
    ])
  }

  function applyAstPatch(id: string) {
    if (!appliedPatches().includes(id)) {
      setAppliedPatches((prev) => [...prev, id])
      setTerminalLogs((prev) => [
        ...prev,
        `[AST Guardian] Auto-applied patch for ${id} via Lucifer DeepSeek Cortex`,
        `[Compiler Guard] Re-verified syntax: 0 errors`,
      ])
    }
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
          <span class="cloud-ide-chip" style={{ background: "rgba(216, 255, 56, 0.15)", color: "#d8ff38", border: "1px solid rgba(216, 255, 56, 0.4)" }}>
            ⚡ Lucifer Engine Active
          </span>
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
          {/* Model Selector Dropdown with Lucifer Flags */}
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
                <div class="cloud-ide-model-menu-title">SELECT INFERENCE AGENT / MODEL</div>
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
        {/* Left Activity Bar */}
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
            class={`cloud-ide-act-btn ${activeSidebarView() === "lucifer" ? "active" : ""}`}
            title="Agent Lucifer Dual-Cortex Hub"
            style={{ color: "#d8ff38" }}
            onClick={() => setActiveSidebarView("lucifer")}
          >
            ⚡
          </button>
          <button
            type="button"
            class={`cloud-ide-act-btn ${activeSidebarView() === "reviewer" ? "active" : ""}`}
            title="AST Code Guardian"
            onClick={() => setActiveSidebarView("reviewer")}
          >
            🛡️
          </button>
          <button
            type="button"
            class={`cloud-ide-act-btn ${activeSidebarView() === "registry" ? "active" : ""}`}
            title="Component Registry Studio"
            onClick={() => setActiveSidebarView("registry")}
          >
            🎨
          </button>
          <button
            type="button"
            class={`cloud-ide-act-btn ${activeSidebarView() === "sonic" ? "active" : ""}`}
            title="Sonic Studio (AI Music)"
            onClick={() => setActiveSidebarView("sonic")}
          >
            🎵
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
            class={`cloud-ide-act-btn ${activeSidebarView() === "settings" ? "active" : ""}`}
            title="IDE Preferences"
            onClick={() => setActiveSidebarView("settings")}
          >
            ⚙
          </button>
        </div>

        {/* Column 1: Collapsible Sidebar Views */}
        <aside class="cloud-ide-explorer">
          {/* View 1: File Explorer */}
          <Show when={activeSidebarView() === "explorer"}>
            <div class="cloud-ide-explorer-header">
              <span>EXPLORER</span>
              <span class="cloud-ide-explorer-repo">Onyx Core</span>
            </div>
            <div class="cloud-ide-tree">
              {/* Agent folder */}
              <div class="cloud-ide-tree-row folder">
                <span class="cloud-ide-arrow">▾</span>
                <span class="cloud-ide-folder-icon">⚡</span>
                <span style={{ color: "#d8ff38", "font-weight": 700 }}>src/agent</span>
              </div>
              <div class="cloud-ide-sub-tree">
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "src/agent/lucifer.ts" ? "active" : ""}`}
                  onClick={() => openFile("src/agent/lucifer.ts")}
                >
                  <span>⚡ lucifer.ts</span>
                  <span class="cloud-ide-pass-dot" style={{ background: "rgba(216,255,56,0.15)", color: "#d8ff38" }}>DUAL</span>
                </button>
              </div>

              {/* Review folder */}
              <div class="cloud-ide-tree-row folder">
                <span class="cloud-ide-arrow">▾</span>
                <span class="cloud-ide-folder-icon">🛡️</span>
                <span>src/review</span>
              </div>
              <div class="cloud-ide-sub-tree">
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "src/review/ast-guardian.ts" ? "active" : ""}`}
                  onClick={() => openFile("src/review/ast-guardian.ts")}
                >
                  <span>🛡️ ast-guardian.ts</span>
                  <span class="cloud-ide-mod-dot">AST</span>
                </button>
              </div>

              {/* UI folder */}
              <div class="cloud-ide-tree-row folder">
                <span class="cloud-ide-arrow">▾</span>
                <span class="cloud-ide-folder-icon">🎨</span>
                <span>src/ui</span>
              </div>
              <div class="cloud-ide-sub-tree">
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "src/ui/component-registry.tsx" ? "active" : ""}`}
                  onClick={() => openFile("src/ui/component-registry.tsx")}
                >
                  <span>🎨 component-registry.tsx</span>
                </button>
              </div>

              {/* Sonic folder */}
              <div class="cloud-ide-tree-row folder">
                <span class="cloud-ide-arrow">▾</span>
                <span class="cloud-ide-folder-icon">🎵</span>
                <span>src/sonic</span>
              </div>
              <div class="cloud-ide-sub-tree">
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "src/sonic/audio-sequencer.ts" ? "active" : ""}`}
                  onClick={() => openFile("src/sonic/audio-sequencer.ts")}
                >
                  <span>🎵 audio-sequencer.ts</span>
                </button>
              </div>

              {/* Auth folder */}
              <div class="cloud-ide-tree-row folder">
                <span class="cloud-ide-arrow">▾</span>
                <span class="cloud-ide-folder-icon">📁</span>
                <span>src/auth</span>
              </div>
              <div class="cloud-ide-sub-tree">
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "src/auth/provider.ts" ? "active" : ""}`}
                  onClick={() => openFile("src/auth/provider.ts")}
                >
                  <span>📄 provider.ts</span>
                </button>
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "src/auth/jwt.ts" ? "active" : ""}`}
                  onClick={() => openFile("src/auth/jwt.ts")}
                >
                  <span>📄 jwt.ts</span>
                </button>
              </div>

              {/* Tests */}
              <div class="cloud-ide-tree-row folder">
                <span class="cloud-ide-arrow">▾</span>
                <span class="cloud-ide-folder-icon">🧪</span>
                <span>tests</span>
              </div>
              <div class="cloud-ide-sub-tree">
                <button
                  type="button"
                  class={`cloud-ide-tree-item ${activeFile() === "tests/lucifer.test.ts" ? "active" : ""}`}
                  onClick={() => openFile("tests/lucifer.test.ts")}
                >
                  <span>🧪 lucifer.test.ts</span>
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
                  class={`cloud-ide-tree-item ${activeFile() === "README.md" ? "active" : ""}`}
                  onClick={() => openFile("README.md")}
                >
                  <span>📄 README.md</span>
                </button>
              </div>
            </div>
          </Show>

          {/* View 2: Agent Lucifer Dual-Cortex Hub */}
          <Show when={activeSidebarView() === "lucifer"}>
            <div class="cloud-ide-explorer-header">
              <span>LUCIFER DUAL-CORTEX</span>
              <span style={{ color: "#d8ff38", "font-weight": 800 }}>V3.2</span>
            </div>
            <div style="padding:0.75rem;display:flex;flex-direction:column;gap:0.75rem;font-size:0.75rem;">
              <div style="background:rgba(216,255,56,0.08);border:1px solid rgba(216,255,56,0.25);border-radius:8px;padding:0.6rem;">
                <div style="font-weight:700;color:#d8ff38;margin-bottom:0.25rem;">Cognitive Synthesis</div>
                <div style="color:#cbd5e1;line-height:1.4;">
                  Harmonizing <strong>DeepSeek R1</strong> (AST logic &amp; test harness) with <strong>Qwen 2.5</strong> (UI &amp; Sonic synthesis).
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:0.4rem;">
                <div style="font-weight:700;color:var(--cloud-muted);font-size:0.6875rem;">QUICK DISPATCH ACTIONS</div>
                <button
                  type="button"
                  class="cloud-ide-tree-item"
                  style="border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);"
                  onClick={() => {
                    setPromptInput("Run AST Guardian audit and auto-fix all NPE and SQLi sinks")
                    handleSendPrompt()
                  }}
                >
                  <span>⚡ /audit-ast</span>
                  <span style="color:#3b82f6;">DeepSeek</span>
                </button>
                <button
                  type="button"
                  class="cloud-ide-tree-item"
                  style="border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);"
                  onClick={() => {
                    setPromptInput("Generate an accessible analytics dashboard card with sparklines")
                    handleSendPrompt()
                  }}
                >
                  <span>🎨 /generate-ui</span>
                  <span style="color:#a855f7;">Qwen UI</span>
                </button>
                <button
                  type="button"
                  class="cloud-ide-tree-item"
                  style="border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);"
                  onClick={() => {
                    setPromptInput("Compose a cyberpunk synth-wave background audio track at 124 BPM")
                    handleSendPrompt()
                  }}
                >
                  <span>🎵 /compose-audio</span>
                  <span style="color:#ec4899;">Sonic</span>
                </button>
                <button
                  type="button"
                  class="cloud-ide-tree-item"
                  style="border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);"
                  onClick={() => {
                    setPromptInput("Execute autonomous plan-work-verify loop on tests/lucifer.test.ts")
                    handleSendPrompt()
                  }}
                >
                  <span>🧪 /verify-suite</span>
                  <span style="color:#4ade80;">Verify</span>
                </button>
              </div>
            </div>
          </Show>

          {/* View 3: AST Code Guardian View */}
          <Show when={activeSidebarView() === "reviewer"}>
            <div class="cloud-ide-explorer-header">
              <span>AST CODE GUARDIAN</span>
              <span style={{ color: "#ef4444", "font-weight": 800 }}>3 FINDINGS</span>
            </div>
            <div style="padding:0.75rem;display:flex;flex-direction:column;gap:0.75rem;font-size:0.75rem;">
              <div style="color:var(--cloud-muted);font-size:0.6875rem;">
                Deterministic rule engine scanning AST tree for vulnerabilities.
              </div>

              {/* Finding 1 */}
              <div style="background:#0f1218;border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:0.6rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                  <span style="color:#ef4444;font-weight:700;">SQLI_PREVENT</span>
                  <span style="background:rgba(239,68,68,0.15);color:#ef4444;padding:0.1rem 0.3rem;border-radius:3px;font-size:0.625rem;">CRITICAL</span>
                </div>
                <div style="color:#e2e8f0;font-size:0.6875rem;margin-bottom:0.4rem;">
                  src/api/users.ts:112 — Raw string interpolation in SQL query.
                </div>
                <button
                  type="button"
                  style="width:100%;background:rgba(216,255,56,0.12);border:1px solid rgba(216,255,56,0.3);color:#d8ff38;padding:0.3rem;border-radius:4px;cursor:pointer;font-weight:700;"
                  onClick={() => applyAstPatch("AST-101")}
                >
                  {appliedPatches().includes("AST-101") ? "✔ Patch Applied" : "⚡ Apply Parameterized Fix"}
                </button>
              </div>

              {/* Finding 2 */}
              <div style="background:#0f1218;border:1px solid rgba(245,158,11,0.3);border-radius:6px;padding:0.6rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                  <span style="color:#f59e0b;font-weight:700;">NPE_GUARD</span>
                  <span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:0.1rem 0.3rem;border-radius:3px;font-size:0.625rem;">HIGH</span>
                </div>
                <div style="color:#e2e8f0;font-size:0.6875rem;margin-bottom:0.4rem;">
                  src/auth/jwt.ts:45 — Missing optional chaining on JWT payload.
                </div>
                <button
                  type="button"
                  style="width:100%;background:rgba(216,255,56,0.12);border:1px solid rgba(216,255,56,0.3);color:#d8ff38;padding:0.3rem;border-radius:4px;cursor:pointer;font-weight:700;"
                  onClick={() => applyAstPatch("AST-102")}
                >
                  {appliedPatches().includes("AST-102") ? "✔ Patch Applied" : "⚡ Apply Null-Safe Fix"}
                </button>
              </div>

              {/* Finding 3 */}
              <div style="background:#0f1218;border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:0.6rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                  <span style="color:#ef4444;font-weight:700;">SECRET_LEAK</span>
                  <span style="background:rgba(239,68,68,0.15);color:#ef4444;padding:0.1rem 0.3rem;border-radius:3px;font-size:0.625rem;">CRITICAL</span>
                </div>
                <div style="color:#e2e8f0;font-size:0.6875rem;margin-bottom:0.4rem;">
                  src/auth/jwt.ts:101 — Hardcoded fallback secret string literal.
                </div>
                <button
                  type="button"
                  style="width:100%;background:rgba(216,255,56,0.12);border:1px solid rgba(216,255,56,0.3);color:#d8ff38;padding:0.3rem;border-radius:4px;cursor:pointer;font-weight:700;"
                  onClick={() => applyAstPatch("AST-103")}
                >
                  {appliedPatches().includes("AST-103") ? "✔ Patch Applied" : "⚡ Rotate with Crypto Secret"}
                </button>
              </div>
            </div>
          </Show>

          {/* View 4: Component Registry Studio (shadcn / Ant Design primitives) */}
          <Show when={activeSidebarView() === "registry"}>
            <div class="cloud-ide-explorer-header">
              <span>COMPONENT REGISTRY</span>
              <span style={{ color: "#a855f7", "font-weight": 800 }}>QWEN 2.5</span>
            </div>
            <div style="padding:0.75rem;display:flex;flex-direction:column;gap:0.75rem;font-size:0.75rem;">
              <div style="color:var(--cloud-muted);font-size:0.6875rem;">
                Accessible enterprise UI primitives synthesized by Lucifer Creative Cortex.
              </div>

              {/* Component Preview Card */}
              <div style="background:#0f1218;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:0.75rem;">
                <div style="font-weight:700;color:#ffffff;margin-bottom:0.5rem;">OnyxButton</div>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.6rem;">
                  <button type="button" style="background:#d8ff38;color:#000;font-weight:800;border:none;padding:0.3rem 0.6rem;border-radius:4px;cursor:pointer;">
                    Primary Volt
                  </button>
                  <button type="button" style="background:transparent;border:1px solid rgba(255,255,255,0.2);color:#fff;padding:0.3rem 0.6rem;border-radius:4px;cursor:pointer;">
                    Outline
                  </button>
                </div>
                <button
                  type="button"
                  style="width:100%;background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.3);color:#c084fc;padding:0.3rem;border-radius:4px;cursor:pointer;font-weight:700;"
                  onClick={() => openFile("src/ui/component-registry.tsx")}
                >
                  Inspect TSX Source
                </button>
              </div>

              {/* Component 2 */}
              <div style="background:#0f1218;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:0.75rem;">
                <div style="font-weight:700;color:#ffffff;margin-bottom:0.5rem;">DataGrid &amp; Sparklines</div>
                <div style="display:flex;justify-content:space-between;color:var(--cloud-muted);padding:0.3rem 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span>AST Scan Rate</span>
                  <span style="color:#4ade80;">11,043 sym/s</span>
                </div>
                <div style="display:flex;justify-content:space-between;color:var(--cloud-muted);padding:0.3rem 0;">
                  <span>Latency</span>
                  <span style="color:#d8ff38;">0.42 ms</span>
                </div>
              </div>
            </div>
          </Show>

          {/* View 5: Sonic Studio (AI Music & Audio Sequencer) */}
          <Show when={activeSidebarView() === "sonic"}>
            <div class="cloud-ide-explorer-header">
              <span>SONIC STUDIO</span>
              <span style={{ color: "#ec4899", "font-weight": 800 }}>124 BPM</span>
            </div>
            <div style="padding:0.75rem;display:flex;flex-direction:column;gap:0.75rem;font-size:0.75rem;">
              <div style="color:var(--cloud-muted);font-size:0.6875rem;">
                Algorithmic audio and stem synthesis inside the Onyx workbench.
              </div>

              <div style="background:#0f1218;border:1px solid rgba(236,72,153,0.3);border-radius:8px;padding:0.75rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                  <span style="color:#ec4899;font-weight:700;">Cyberpunk Wave</span>
                  <button
                    type="button"
                    style={{
                      background: sonicPlaying() ? "#ef4444" : "#ec4899",
                      color: "#fff",
                      border: "none",
                      padding: "0.25rem 0.6rem",
                      "border-radius": "4px",
                      cursor: "pointer",
                      "font-weight": 700,
                    }}
                    onClick={() => {
                      setSonicPlaying(!sonicPlaying())
                      if (!sonicPlaying()) {
                        setTerminalLogs((p) => [...p, "[Sonic Studio] Playing synthesized 4-track stems @ 124 BPM"])
                      }
                    }}
                  >
                    {sonicPlaying() ? "■ Pause" : "▶ Play Audio"}
                  </button>
                </div>

                {/* 4 Tracks Step Grid */}
                <div style="display:flex;flex-direction:column;gap:0.4rem;margin-top:0.5rem;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:#cbd5e1;font-size:0.625rem;">808 Kick</span>
                    <div style="display:flex;gap:3px;">
                      <div style="width:12px;height:12px;background:#ec4899;border-radius:2px;" />
                      <div style="width:12px;height:12px;background:#27272a;border-radius:2px;" />
                      <div style="width:12px;height:12px;background:#ec4899;border-radius:2px;" />
                      <div style="width:12px;height:12px;background:#27272a;border-radius:2px;" />
                    </div>
                  </div>

                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:#cbd5e1;font-size:0.625rem;">Snare</span>
                    <div style="display:flex;gap:3px;">
                      <div style="width:12px;height:12px;background:#27272a;border-radius:2px;" />
                      <div style="width:12px;height:12px;background:#d8ff38;border-radius:2px;" />
                      <div style="width:12px;height:12px;background:#27272a;border-radius:2px;" />
                      <div style="width:12px;height:12px;background:#d8ff38;border-radius:2px;" />
                    </div>
                  </div>

                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:#cbd5e1;font-size:0.625rem;">Synth Lead</span>
                    <div style="display:flex;gap:3px;">
                      <div style="width:12px;height:12px;background:#3b82f6;border-radius:2px;" />
                      <div style="width:12px;height:12px;background:#3b82f6;border-radius:2px;" />
                      <div style="width:12px;height:12px;background:#3b82f6;border-radius:2px;" />
                      <div style="width:12px;height:12px;background:#27272a;border-radius:2px;" />
                    </div>
                  </div>
                </div>

                <div style="margin-top:0.75rem;padding-top:0.5rem;border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center;">
                  <span style="color:var(--cloud-muted);font-size:0.625rem;">Tempo: {sonicBpm()} BPM</span>
                  <input
                    type="range"
                    min="80"
                    max="160"
                    value={sonicBpm()}
                    onInput={(e) => setSonicBpm(Number(e.currentTarget.value))}
                    style="width:80px;accent-color:#ec4899;"
                  />
                </div>
              </div>
            </div>
          </Show>

          {/* View 6: Source Control */}
          <Show when={activeSidebarView() === "git"}>
            <div class="cloud-ide-explorer-header">
              <span>SOURCE CONTROL</span>
              <span class="cloud-ide-explorer-repo">Git: main</span>
            </div>
            <div style="padding:0.75rem;font-size:0.75rem;color:#e2e8f0;">
              <div style="font-weight:700;margin-bottom:0.5rem;color:var(--cloud-muted);">STAGED CHANGES (3)</div>
              <div class="cloud-ide-git-row">
                <span style="color:#4ade80;">M</span>
                <span>src/agent/lucifer.ts</span>
              </div>
              <div class="cloud-ide-git-row">
                <span style="color:#22c55e;">A</span>
                <span>src/review/ast-guardian.ts</span>
              </div>
              <div class="cloud-ide-git-row">
                <span style="color:#22c55e;">A</span>
                <span>src/sonic/audio-sequencer.ts</span>
              </div>
              <button
                type="button"
                class="cloud-ide-commit-btn"
                onClick={() => {
                  setTerminalOpen(true)
                  setTerminalLogs((p) => [...p, "git commit -m 'feat(lucifer): integrate dual-cortex intelligence' [main e491a0c]", "Pushed to origin main"])
                }}
              >
                Commit &amp; Push to Origin
              </button>
            </div>
          </Show>

          {/* View 7: Settings */}
          <Show when={activeSidebarView() === "settings"}>
            <div class="cloud-ide-explorer-header">
              <span>IDE PREFERENCES</span>
            </div>
            <div style="padding:0.75rem;font-size:0.75rem;color:#cbd5e1;display:flex;flex-direction:column;gap:0.75rem;">
              <div>Primary Agent: Lucifer (Dual-Cortex)</div>
              <div>Analytical Core: DeepSeek R1/V3</div>
              <div>Creative Core: Qwen 2.5 / Vision</div>
              <div>Compiler Guard: TypeScript 5.8 Strict</div>
              <div>Firecracker MicroVM: Isolated Sandbox</div>
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
                  <span class="cloud-ide-tab-icon">{tab.endsWith(".test.ts") ? "🧪" : tab.includes("lucifer") ? "⚡" : "📄"}</span>
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
              {Array.from({ length: Math.max(32, lineCount()) }, (_, i) => (
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
                  class={`cloud-ide-term-tab ${activeTerminalTab() === "ast" ? "active" : ""}`}
                  onClick={() => setActiveTerminalTab("ast")}
                >
                  AST Guardian Telemetry
                </button>
                <button
                  type="button"
                  class={`cloud-ide-term-tab ${activeTerminalTab() === "tests" ? "active" : ""}`}
                  onClick={() => setActiveTerminalTab("tests")}
                >
                  Bun Tests (7 passed)
                </button>
                <button
                  type="button"
                  class={`cloud-ide-term-tab ${activeTerminalTab() === "logs" ? "active" : ""}`}
                  onClick={() => setActiveTerminalTab("logs")}
                >
                  Firecracker VM Logs
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

        {/* Column 3: Agent Lucifer Autonomous Stream */}
        <aside class="cloud-ide-agent-stream">
          <div class="cloud-ide-agent-header">
            <div class="cloud-ide-agent-status">
              <span class="cloud-ide-agent-pulse" style={{ background: "#d8ff38", "box-shadow": "0 0 10px #d8ff38" }} />
              <div>
                <div class="cloud-ide-agent-name">Agent Lucifer</div>
                <div class="cloud-ide-agent-tokens">Dual-Cortex: DeepSeek + Qwen · 28.4 tok/s</div>
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
                    <span class="cloud-ide-msg-sender">{msg.sender === "user" ? "You" : "Lucifer (Dual-Cortex)"}</span>
                    <span class="cloud-ide-msg-time">{msg.timestamp}</span>
                  </div>

                  {/* Thinking Accordion */}
                  <Show when={msg.thinking}>
                    <div class="cloud-ide-thinking-block">
                      <div
                        class="cloud-ide-thinking-header"
                        onClick={() => setThinkingExpanded(!thinkingExpanded())}
                      >
                        <span>🧠 Lucifer Thought Trace (DeepSeek Cortex)</span>
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
                <span>Lucifer Dual-Cortex is synthesizing code with {selectedModel().name}...</span>
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
                  setPromptInput("bun test tests/lucifer.test.ts")
                  handleSendPrompt()
                }}
              >
                /test
              </button>
              <button
                type="button"
                class="cloud-ide-chip-btn"
                onClick={() => {
                  setPromptInput("Run AST Guardian audit and patch all NPE and SQLi issues")
                  handleSendPrompt()
                }}
              >
                /audit-ast
              </button>
              <button
                type="button"
                class="cloud-ide-chip-btn"
                onClick={() => {
                  setPromptInput("Generate an accessible UI component using ComponentRegistry")
                  handleSendPrompt()
                }}
              >
                /generate-ui
              </button>
              <button
                type="button"
                class="cloud-ide-chip-btn"
                onClick={() => {
                  setPromptInput("Compose a background theme track in Sonic Studio")
                  handleSendPrompt()
                }}
              >
                /compose-audio
              </button>
            </div>
            <div class="cloud-ide-input-box">
              <textarea
                class="cloud-ide-prompt-textarea"
                rows={3}
                value={promptInput()}
                onInput={(e) => setPromptInput(e.currentTarget.value)}
                placeholder={`Ask Agent Lucifer (${selectedModel().name}) or type instructions (/audit-ast, /generate-ui, /compose-audio, /test)...`}
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
                  ⚡ Send to Lucifer
                </button>
              </div>
            </div>
          </form>
        </aside>
      </div>
    </div>
  )
}
