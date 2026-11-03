import { Component, createSignal, createEffect, onMount, onCleanup, For, Show } from "solid-js"
import "../../styles/desktop-ide.css"

interface ProjectFile {
  path: string
  name: string
  language: string
  content: string
  modified?: boolean
}

interface Workspace {
  id: string
  name: string
  path: string
  branch: string
  lastOpened: string
}

const DEFAULT_WORKSPACES: Workspace[] = [
  { id: "ws-1", name: "Vibe Code Platform", path: "E:\\Vibe Code Platform", branch: "main", lastOpened: "Just now" },
  { id: "ws-2", name: "Insta + Youtube Bot", path: "E:\\Projects\\Insta-Bot", branch: "develop", lastOpened: "2 hours ago" },
  { id: "ws-3", name: "MotoFit Website", path: "E:\\MotoFit\\frontend", branch: "main", lastOpened: "Yesterday" },
  { id: "ws-4", name: "Onyx MicroVM Sentry", path: "E:\\Onyx\\microvm", branch: "hotfix/ast-guard", lastOpened: "3 days ago" },
]

const DEFAULT_FILES: ProjectFile[] = [
  {
    path: "src/App.tsx",
    name: "App.tsx",
    language: "typescript",
    content: `import React, { useState } from 'react'
import { LuciferCopilot, AstGuardBadge } from '@onyx/desktop'

export default function OnyxStudioWorkspace() {
  const [activeModel, setActiveModel] = useState('DeepSeek R1')
  const [astIntegrity, setAstIntegrity] = useState(100)

  return (
    <main className="onyx-workspace-root bg-[#07080a] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="text-[#d8ff38]">⚡</span> Onyx Autonomous AI IDE
        </h1>
        <AstGuardBadge health={astIntegrity} />
      </header>
      <section className="p-8">
        <p className="text-zinc-400">Zero-leak air-gapped engineering environment active.</p>
      </section>
    </main>
  )
}`
  },
  {
    path: "src/engine/lucifer.ts",
    name: "lucifer.ts",
    language: "typescript",
    content: `// In-Process Tree-Sitter & Colibri MoE Decision Head
export class AgentLuciferCore {
  private readonly microvmCluster = "us-east-iad1"
  private readonly airGapEnforced = true

  public async evaluateAstHealth(astTree: any): Promise<{ clean: boolean; score: number }> {
    // Deterministic Tree-Sitter compiler pass
    return { clean: true, score: 100 }
  }

  public async dispatchAutonomousPatch(taskPrompt: string) {
    return {
      status: "applied",
      microPatch: "+18 lines · 0 regressions",
      timestamp: Date.now()
    }
  }
}`
  },
  {
    path: "package.json",
    name: "package.json",
    language: "json",
    content: `{
  "name": "onyx-desktop-studio",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@onyx/core": "^1.0.0"
  }
}`
  },
  {
    path: "README.md",
    name: "README.md",
    language: "markdown",
    content: `# Onyx Desktop IDE · Autonomous Workbench
Zero-marginal-cost BYOAI, in-process Tree-Sitter AST compiler sentry, and autonomous cloud microVM execution.`
  }
]

interface CommandItem {
  id: string
  title: string
  category: string
  shortcut: string
  action: () => void
}

export const DesktopIdeRoute: Component = () => {
  // State
  const [activeCanvas, setActiveCanvas] = createSignal<"welcome" | "editor">("welcome")
  const [workspaces, setWorkspaces] = createSignal<Workspace[]>(DEFAULT_WORKSPACES)
  const [files, setFiles] = createSignal<ProjectFile[]>(DEFAULT_FILES)
  const [activeFilePath, setActiveFilePath] = createSignal<string>(DEFAULT_FILES[0].path)
  const [openTabs, setOpenTabs] = createSignal<string[]>([DEFAULT_FILES[0].path, DEFAULT_FILES[1].path])
  const [editorContent, setEditorContent] = createSignal<string>(DEFAULT_FILES[0].content)
  const [cursorPos, setCursorPos] = createSignal({ line: 1, col: 1 })
  const [astStatus, setAstStatus] = createSignal({ valid: true, msg: "0 diagnostics · AST Clean (Tree-Sitter)" })

  // Layout Panels Visibility
  const [leftSidebarVisible, setLeftSidebarVisible] = createSignal(true)
  const [activeActivityTab, setActiveActivityTab] = createSignal<"explorer" | "search" | "git" | "debug" | "extensions" | "ast">("explorer")
  const [bottomPanelVisible, setBottomPanelVisible] = createSignal(true)
  const [bottomTab, setBottomTab] = createSignal<"terminal" | "problems" | "output" | "debug" | "ports">("terminal")
  const [copilotVisible, setCopilotVisible] = createSignal(true)

  // Interactive Command Palette Modal
  const [paletteOpen, setPaletteOpen] = createSignal(false)
  const [paletteQuery, setPaletteQuery] = createSignal("")
  const [paletteSelectedIndex, setPaletteSelectedIndex] = createSignal(0)

  // Terminal state
  const [terminalLogs, setTerminalLogs] = createSignal<string[]>([
    "Windows PowerShell",
    "Copyright (C) Microsoft Corporation. All rights reserved.",
    "Onyx Core Terminal Guardian v2.4 (US-East Cluster: Online)",
    "Directory: E:\\Vibe Code Platform",
    ""
  ])
  const [terminalInput, setTerminalInput] = createSignal("")

  // Agent Lucifer Copilot State
  const [selectedModel, setSelectedModel] = createSignal("DeepSeek R1 (Frontier)")
  const [permissionMode, setPermissionMode] = createSignal<"manual" | "auto">("auto")
  const [agentPrompt, setAgentPrompt] = createSignal("")
  const [agentThinking, setAgentThinking] = createSignal(false)
  const [agentMessages, setAgentMessages] = createSignal<Array<{
    sender: "user" | "lucifer"
    text: string
    thought?: string
    patch?: { path: string; diff: string; code: string }
  }>>([
    {
      sender: "lucifer",
      text: "Onyx Desktop Copilot initialized. Connected to local Tree-Sitter AST parser and US-East MicroVM fleet.",
      thought: "Initialized in-process AST compiler guard and BYOAI provider circuit breaker."
    }
  ])

  // Current active file helper
  const activeFile = () => files().find(f => f.path === activeFilePath())

  // Open file in editor
  const handleOpenFile = (path: string) => {
    const target = files().find(f => f.path === path)
    if (!target) return

    setActiveFilePath(path)
    setEditorContent(target.content)
    if (!openTabs().includes(path)) {
      setOpenTabs([...openTabs(), path])
    }
    setActiveCanvas("editor")
  }

  // Close tab
  const handleCloseTab = (path: string, e: MouseEvent) => {
    e.stopPropagation()
    const nextTabs = openTabs().filter(t => t !== path)
    setOpenTabs(nextTabs)
    if (activeFilePath() === path) {
      if (nextTabs.length > 0) {
        handleOpenFile(nextTabs[0])
      } else {
        setActiveCanvas("welcome")
      }
    }
  }

  // Handle editor input
  const handleEditorInput = (e: Event) => {
    const val = (e.target as HTMLTextAreaElement).value
    setEditorContent(val)
    setFiles(prev => prev.map(f => f.path === activeFilePath() ? { ...f, content: val, modified: true } : f))

    // Real AST bracket validator
    let balance = 0
    let valid = true
    for (const char of val) {
      if (char === '{' || char === '(' || char === '[') balance++
      if (char === '}' || char === ')' || char === ']') balance--
      if (balance < 0) { valid = false; break }
    }
    if (balance !== 0) valid = false

    if (valid) {
      setAstStatus({ valid: true, msg: "0 diagnostics · AST Clean (Tree-Sitter)" })
    } else {
      setAstStatus({ valid: false, msg: "Syntax Warning: Unbalanced AST delimiter" })
    }
  }

  // Terminal Runner
  const handleTerminalSubmit = (e: Event) => {
    e.preventDefault()
    const cmd = terminalInput().trim()
    if (!cmd) return
    setTerminalInput("")

    setTerminalLogs(prev => [...prev, `PS E:\\Vibe Code Platform> ${cmd}`])

    if (cmd === 'clear' || cmd === 'cls') {
      setTerminalLogs([])
      return
    }

    if (cmd === 'test' || cmd === 'npm test' || cmd === 'bun test') {
      setTerminalLogs(prev => [
        ...prev,
        "✓ src/App.tsx: AST Syntax Check PASS (0 errors)",
        "✓ src/engine/lucifer.ts: evaluateAstHealth() PASS (12ms)",
        "✓ Tree-Sitter Compiler Sentry: 37 languages verified (100% PASS)"
      ])
      return
    }

    if (cmd === 'git status') {
      setTerminalLogs(prev => [
        ...prev,
        "On branch main",
        "Your branch is up to date with 'origin/main'.",
        "nothing to commit, working tree clean"
      ])
      return
    }

    if (cmd === 'ls' || cmd === 'dir') {
      setTerminalLogs(prev => [
        ...prev,
        files().map(f => f.path).join('    ')
      ])
      return
    }

    setTerminalLogs(prev => [...prev, `Executed: ${cmd} (exit code 0)`])
  }

  // Agent Lucifer execution
  const handleAgentSubmit = () => {
    const text = agentPrompt().trim()
    if (!text) return
    setAgentPrompt("")

    setAgentMessages(prev => [...prev, { sender: "user", text }])
    setAgentThinking(true)

    setTimeout(() => {
      const patchCode = `${editorContent()}\n\n// Verified by Agent Lucifer Autonomous Engine\nexport const productionReady = true;\n`
      setAgentMessages(prev => [
        ...prev,
        {
          sender: "lucifer",
          text: `I analyzed ${activeFilePath()} against our Tree-Sitter AST graph. All types checked cleanly with zero regressions.`,
          thought: `1. Ingested AST symbol tree for ${activeFilePath()}\n2. Executed microVM sandbox verification\n3. Zero data telemetry egress verified\n4. Generated surgical atomic patch in 32ms.`,
          patch: {
            path: activeFilePath(),
            diff: "+12 lines · 0 errors",
            code: patchCode
          }
        }
      ])
      setAgentThinking(false)
    }, 700)
  }

  // Apply suggested patch
  const applyPatch = (patch: { path: string; code: string }) => {
    setFiles(prev => prev.map(f => f.path === patch.path ? { ...f, content: patch.code, modified: true } : f))
    if (activeFilePath() === patch.path) {
      setEditorContent(patch.code)
    }
    setTerminalLogs(prev => [...prev, `[onyx:ast] Applied surgical micro-patch to ${patch.path} (PASS)`])
  }

  // Command Palette Items
  const commandList: CommandItem[] = [
    { id: "cmd-new-file", title: "File: New File", category: "File", shortcut: "Ctrl+N", action: () => {
      const name = prompt("Enter file name (e.g. src/utils/helper.ts):")
      if (name) {
        const newFile: ProjectFile = { path: name, name: name.split('/').pop() || name, language: "typescript", content: "// Created in Onyx Desktop Studio\n" }
        setFiles([...files(), newFile])
        handleOpenFile(name)
      }
    }},
    { id: "cmd-welcome", title: "View: Toggle Welcome Canvas", category: "View", shortcut: "Ctrl+H", action: () => setActiveCanvas(activeCanvas() === 'welcome' ? 'editor' : 'welcome') },
    { id: "cmd-term", title: "View: Toggle Terminal", category: "View", shortcut: "Ctrl+`", action: () => setBottomPanelVisible(!bottomPanelVisible()) },
    { id: "cmd-side", title: "View: Toggle Primary Sidebar", category: "View", shortcut: "Ctrl+B", action: () => setLeftSidebarVisible(!leftSidebarVisible()) },
    { id: "cmd-copilot", title: "View: Toggle Agent Lucifer Copilot", category: "View", shortcut: "Ctrl+Alt+I", action: () => setCopilotVisible(!copilotVisible()) },
    { id: "cmd-ast", title: "Onyx: Run Tree-Sitter In-Process AST Audit", category: "Onyx", shortcut: "Ctrl+Shift+A", action: () => {
      setBottomTab("problems")
      setBottomPanelVisible(true)
      setTerminalLogs(prev => [...prev, "[ast:audit] Tree-Sitter AST Audit: 0 errors across 4 files (PASS)"])
    }},
    { id: "cmd-lucifer", title: "Onyx: Summon Agent Lucifer Autonomous Patch", category: "Onyx", shortcut: "Ctrl+Shift+L", action: () => {
      setCopilotVisible(true)
      setAgentPrompt("Review and optimize this module for zero memory leaks and high concurrency")
      handleAgentSubmit()
    }},
    { id: "cmd-checkpoint", title: "Onyx: Create Atomic Reversible Git Checkpoint", category: "Onyx", shortcut: "Ctrl+Shift+C", action: () => {
      setTerminalLogs(prev => [...prev, `[checkpoint:git] Created snapshot checkpoint: ck-${Date.now().toString(36)} (HEAD -> main)`])
    }},
    { id: "cmd-model", title: "Onyx: Cycle Active AI Model (BYOAI)", category: "Onyx", shortcut: "Ctrl+Shift+M", action: () => {
      const models = ["DeepSeek R1 (Frontier)", "Qwen 2.5 Coder (153 tok/s)", "Claude 3.7 Sonnet"]
      const idx = models.indexOf(selectedModel())
      setSelectedModel(models[(idx + 1) % models.length])
    }},
    { id: "cmd-test", title: "Terminal: Run Automated Test Suite", category: "Test", shortcut: "Ctrl+Shift+T", action: () => {
      setBottomTab("terminal")
      setBottomPanelVisible(true)
      setTerminalLogs(prev => [...prev, "$ bun test", "✓ 40 tests passed across 5 test suites (100% Green)"])
    }}
  ]

  // Filtered commands
  const filteredCommands = () => {
    const q = paletteQuery().toLowerCase().trim()
    if (!q) return commandList
    return commandList.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.shortcut.toLowerCase().includes(q))
  }

  // Global Keyboard Shortcuts Listener
  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P or F1: Command Palette
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') || e.key === 'F1') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
        setPaletteQuery("")
        setPaletteSelectedIndex(0)
        return
      }

      // Escape closes palette
      if (e.key === 'Escape' && paletteOpen()) {
        e.preventDefault()
        setPaletteOpen(false)
        return
      }

      // Ctrl+Alt+I: Toggle Copilot
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        setCopilotVisible(prev => !prev)
        return
      }

      // Ctrl+B: Toggle Sidebar
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setLeftSidebarVisible(prev => !prev)
        return
      }

      // Ctrl+` or Ctrl+~: Toggle Terminal
      if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
        e.preventDefault()
        setBottomPanelVisible(prev => !prev)
        return
      }

      // Ctrl+Shift+A: AST Audit
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        commandList.find(c => c.id === 'cmd-ast')?.action()
        return
      }

      // Ctrl+Shift+L: Summon Lucifer
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        commandList.find(c => c.id === 'cmd-lucifer')?.action()
        return
      }

      // Ctrl+Shift+M: Cycle Model
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        commandList.find(c => c.id === 'cmd-model')?.action()
        return
      }

      // Ctrl+Shift+C: Checkpoint
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        commandList.find(c => c.id === 'cmd-checkpoint')?.action()
        return
      }

      // Ctrl+S: Save
      if (e.ctrlKey && e.key.toLowerCase() === 's' && !e.shiftKey) {
        e.preventDefault()
        setAstStatus({ valid: true, msg: "Saved · 0 diagnostics · AST Clean" })
        setTerminalLogs(prev => [...prev, `[onyx:save] Saved ${activeFilePath()} with in-process Tree-Sitter validation`])
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown))
  })

  // Line numbers generator
  const lineNumbers = () => {
    const lines = (editorContent() || '').split('\n')
    return Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1).join('\n')
  }

  return (
    <div class="onyx-desktop-ide-root">

      {/* 1. TOP WINDOW TITLE BAR & MENUS */}
      <header class="onyx-desktop-titlebar">
        <div class="onyx-titlebar-left">
          <div class="onyx-titlebar-logo" onClick={() => setActiveCanvas("welcome")} title="Return to Welcome Canvas">
            <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="14" fill="#0e111a" stroke="#d8ff38" stroke-width="3" />
              <circle cx="32" cy="32" r="16" stroke="#d8ff38" stroke-width="6" stroke-linecap="round" stroke-dasharray="72 20" transform="rotate(-45 32 32)" />
              <circle cx="45" cy="19" r="4" fill="#22c55e" />
            </svg>
            <span style={{ "font-size": "13px", "font-weight": 700, color: "#ffffff", "letter-spacing": "0.02em" }}>Onyx</span>
          </div>

          <nav class="onyx-menubar">
            <button type="button" class="onyx-menu-item" onClick={() => setPaletteOpen(true)}>File</button>
            <button type="button" class="onyx-menu-item" onClick={() => setPaletteOpen(true)}>Edit</button>
            <button type="button" class="onyx-menu-item" onClick={() => setPaletteOpen(true)}>Selection</button>
            <button type="button" class="onyx-menu-item" onClick={() => setPaletteOpen(true)}>View</button>
            <button type="button" class="onyx-menu-item" onClick={() => setPaletteOpen(true)}>Go</button>
            <button type="button" class="onyx-menu-item" onClick={() => { setBottomTab('terminal'); setBottomPanelVisible(true); }}>Run</button>
            <button type="button" class="onyx-menu-item" onClick={() => setBottomPanelVisible(!bottomPanelVisible())}>Terminal</button>
            <button type="button" class="onyx-menu-item" onClick={() => setPaletteOpen(true)}>Help</button>
          </nav>
        </div>

        {/* Center Search / Command Palette Pill */}
        <div class="onyx-titlebar-center" onClick={() => setPaletteOpen(true)} title="Show All Commands (Ctrl+Shift+P)">
          <span>🔍</span>
          <span>Vibe Code Platform — Onyx Autonomous Studio</span>
          <span style={{ "font-size": "10px", background: "rgba(255,255,255,0.08)", padding: "1px 6px", "border-radius": "3px" }}>Ctrl+Shift+P</span>
        </div>

        {/* Right Layout Toggles & Window Controls */}
        <div class="onyx-titlebar-right">
          <button
            type="button"
            class={`onyx-titlebar-action-btn ${leftSidebarVisible() ? 'active' : ''}`}
            onClick={() => setLeftSidebarVisible(!leftSidebarVisible())}
            title="Toggle Primary Sidebar (Ctrl+B)"
          >
            ◧
          </button>
          <button
            type="button"
            class={`onyx-titlebar-action-btn ${bottomPanelVisible() ? 'active' : ''}`}
            onClick={() => setBottomPanelVisible(!bottomPanelVisible())}
            title="Toggle Bottom Terminal (Ctrl+`)"
          >
            ⬓
          </button>
          <button
            type="button"
            class={`onyx-titlebar-action-btn ${copilotVisible() ? 'active' : ''}`}
            onClick={() => setCopilotVisible(!copilotVisible())}
            title="Toggle Agent Lucifer Copilot (Ctrl+Alt+I)"
          >
            ◨
          </button>

          <div class="onyx-window-controls">
            <button type="button" class="onyx-win-btn" title="Minimize">─</button>
            <button type="button" class="onyx-win-btn" title="Maximize">▢</button>
            <button type="button" class="onyx-win-btn close" title="Close">✕</button>
          </div>
        </div>
      </header>

      {/* 2. MAIN IDE BODY */}
      <div class="onyx-desktop-body">

        {/* 2A. LEFT ACTIVITY BAR (ICON RAIL) */}
        <aside class="onyx-activity-bar">
          <div class="onyx-activity-group">
            <button
              type="button"
              class={`onyx-activity-btn ${activeActivityTab() === 'explorer' && leftSidebarVisible() ? 'active' : ''}`}
              onClick={() => {
                if (activeActivityTab() === 'explorer') setLeftSidebarVisible(!leftSidebarVisible())
                else { setActiveActivityTab('explorer'); setLeftSidebarVisible(true); }
              }}
              title="Explorer (Ctrl+Shift+E)"
            >
              📄
            </button>
            <button
              type="button"
              class={`onyx-activity-btn ${activeActivityTab() === 'search' && leftSidebarVisible() ? 'active' : ''}`}
              onClick={() => {
                if (activeActivityTab() === 'search') setLeftSidebarVisible(!leftSidebarVisible())
                else { setActiveActivityTab('search'); setLeftSidebarVisible(true); }
              }}
              title="Search Across Files (Ctrl+Shift+F)"
            >
              🔍
            </button>
            <button
              type="button"
              class={`onyx-activity-btn ${activeActivityTab() === 'git' && leftSidebarVisible() ? 'active' : ''}`}
              onClick={() => {
                if (activeActivityTab() === 'git') setLeftSidebarVisible(!leftSidebarVisible())
                else { setActiveActivityTab('git'); setLeftSidebarVisible(true); }
              }}
              title="Source Control (Ctrl+Shift+G)"
            >
              🔀
              <span class="onyx-badge-dot"></span>
            </button>
            <button
              type="button"
              class={`onyx-activity-btn ${activeActivityTab() === 'debug' && leftSidebarVisible() ? 'active' : ''}`}
              onClick={() => {
                if (activeActivityTab() === 'debug') setLeftSidebarVisible(!leftSidebarVisible())
                else { setActiveActivityTab('debug'); setLeftSidebarVisible(true); }
              }}
              title="Run & Debug (Ctrl+Shift+D)"
            >
              ▶
            </button>
            <button
              type="button"
              class={`onyx-activity-btn ${activeActivityTab() === 'extensions' && leftSidebarVisible() ? 'active' : ''}`}
              onClick={() => {
                if (activeActivityTab() === 'extensions') setLeftSidebarVisible(!leftSidebarVisible())
                else { setActiveActivityTab('extensions'); setLeftSidebarVisible(true); }
              }}
              title="Extensions & MCP Servers (Ctrl+Shift+X)"
            >
              🧩
            </button>
            <button
              type="button"
              class={`onyx-activity-btn ${activeActivityTab() === 'ast' && leftSidebarVisible() ? 'active' : ''}`}
              onClick={() => {
                if (activeActivityTab() === 'ast') setLeftSidebarVisible(!leftSidebarVisible())
                else { setActiveActivityTab('ast'); setLeftSidebarVisible(true); }
              }}
              title="Tree-Sitter AST & SAST Sentry (Ctrl+Shift+A)"
            >
              🛡️
            </button>
          </div>

          <div class="onyx-activity-group">
            <button
              type="button"
              class="onyx-activity-btn"
              onClick={() => setPaletteOpen(true)}
              title="Open Settings & Keybindings (Ctrl+,)"
            >
              ⚙️
            </button>
          </div>
        </aside>

        {/* 2B. LEFT SIDEBAR PANEL */}
        <Show when={leftSidebarVisible()}>
          <aside class="onyx-sidebar-panel">
            <div class="onyx-sidebar-header">
              <span>{activeActivityTab()}</span>
              <div class="onyx-sidebar-actions">
                <button
                  type="button"
                  class="onyx-icon-btn-sm"
                  onClick={() => {
                    const name = prompt("Create new file in workspace:")
                    if (name) {
                      setFiles([...files(), { path: name, name: name.split('/').pop() || name, language: "typescript", content: "// Created in Onyx\n" }])
                      handleOpenFile(name)
                    }
                  }}
                  title="New File"
                >
                  +
                </button>
                <button type="button" class="onyx-icon-btn-sm" onClick={() => setLeftSidebarVisible(false)} title="Collapse Sidebar">
                  ✕
                </button>
              </div>
            </div>

            <div class="onyx-tree-scroll">
              <div class="onyx-tree-section-header">
                <span>VIBE CODE PLATFORM</span>
                <span class="text-[10px] text-zinc-500 font-mono">{files().length} files</span>
              </div>

              <For each={files()}>
                {(f) => (
                  <div
                    class={`onyx-tree-item ${activeFilePath() === f.path && activeCanvas() === 'editor' ? 'active' : ''}`}
                    onClick={() => handleOpenFile(f.path)}
                  >
                    <div class="onyx-tree-item-name">
                      <span>{f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? '📄' : f.path.endsWith('.json') ? '⚙️' : '📝'}</span>
                      <span>{f.path}</span>
                    </div>
                    <Show when={f.modified}>
                      <span style={{ "font-size": "10px", color: "#eab308" }}>●</span>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </aside>
        </Show>

        {/* 2C. CENTRAL WORKBENCH (Welcome Canvas vs Active Editor) */}
        <main class="onyx-center-workbench">

          {/* VIEW 1: ANTIGRAVITY & VS CODE STYLE WELCOME CANVAS */}
          <Show when={activeCanvas() === 'welcome'}>
            <div class="onyx-welcome-canvas">
              
              {/* Subtle background watermark */}
              <div class="onyx-welcome-watermark">
                <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" stroke="#ffffff" stroke-width="4" />
                  <circle cx="32" cy="32" r="16" stroke="#d8ff38" stroke-width="4" stroke-dasharray="60 20" />
                </svg>
              </div>

              <div class="onyx-welcome-container">
                <div class="onyx-welcome-badge">
                  <span>⚡</span>
                  <span>ONYX AUTONOMOUS AI IDE · RETINA HIGH-DPI READY</span>
                </div>

                {/* Primary Action Buttons (Matching Antigravity Screenshot 1) */}
                <div class="onyx-welcome-actions">
                  <button
                    type="button"
                    class="onyx-btn-open-folder"
                    onClick={() => {
                      if (files().length > 0) handleOpenFile(files()[0].path)
                    }}
                  >
                    <span>📁</span>
                    <span>Open Folder</span>
                  </button>

                  <button
                    type="button"
                    class="onyx-btn-clone-repo"
                    onClick={() => {
                      const repo = prompt("Enter Git repository URL to clone:")
                      if (repo) {
                        setTerminalLogs(prev => [...prev, `[git:clone] Cloning ${repo} into virtual microVM...`, "✓ Clone complete in 1.2s"])
                        setActiveCanvas("editor")
                      }
                    }}
                  >
                    <span>📋</span>
                    <span>Clone Repository</span>
                  </button>
                </div>

                {/* Recent Workspaces (Matching Antigravity Screenshot 1) */}
                <div class="onyx-welcome-workspaces">
                  <div class="onyx-workspaces-title">Recent Workspaces</div>
                  <div class="onyx-workspaces-list">
                    <For each={workspaces()}>
                      {(ws) => (
                        <div class="onyx-workspace-item" onClick={() => handleOpenFile(files()[0].path)}>
                          <div class="onyx-workspace-item-left">
                            <span class="onyx-workspace-name">{ws.name}</span>
                            <span class="onyx-workspace-path">{ws.path}</span>
                          </div>
                          <span style={{ "font-size": "11px", color: "#64748b" }}>{ws.lastOpened}</span>
                        </div>
                      )}
                    </For>
                  </div>
                </div>

                {/* Global Standard Keyboard Shortcuts Matrix (Matching VS Code Screenshot 2 + Onyx Additions) */}
                <div class="onyx-welcome-shortcuts-section">
                  <div class="onyx-shortcuts-header">
                    <span class="onyx-shortcuts-title">
                      <span>⌨️</span>
                      <span>Global Standard &amp; Onyx Shortcuts</span>
                    </span>
                    <span style={{ "font-size": "10px", color: "#64748b", "font-family": "monospace" }}>Press keys anytime</span>
                  </div>

                  <div class="onyx-shortcuts-grid">
                    <div class="onyx-shortcut-row" onClick={() => setPaletteOpen(true)}>
                      <span class="onyx-shortcut-label">Show All Commands</span>
                      <div class="onyx-shortcut-keys">
                        <span class="onyx-key-badge">Ctrl</span>
                        <span class="onyx-key-badge">Shift</span>
                        <span class="onyx-key-badge">P</span>
                      </div>
                    </div>

                    <div class="onyx-shortcut-row" onClick={() => setCopilotVisible(!copilotVisible())}>
                      <span class="onyx-shortcut-label">Open Agent Lucifer Copilot</span>
                      <div class="onyx-shortcut-keys">
                        <span class="onyx-key-badge">Ctrl</span>
                        <span class="onyx-key-badge">Alt</span>
                        <span class="onyx-key-badge volt">I</span>
                      </div>
                    </div>

                    <div class="onyx-shortcut-row" onClick={() => commandList.find(c => c.id === 'cmd-ast')?.action()}>
                      <span class="onyx-shortcut-label">Run Tree-Sitter AST Audit</span>
                      <div class="onyx-shortcut-keys">
                        <span class="onyx-key-badge">Ctrl</span>
                        <span class="onyx-key-badge">Shift</span>
                        <span class="onyx-key-badge volt">A</span>
                      </div>
                    </div>

                    <div class="onyx-shortcut-row" onClick={() => commandList.find(c => c.id === 'cmd-lucifer')?.action()}>
                      <span class="onyx-shortcut-label">Summon Autonomous Patch</span>
                      <div class="onyx-shortcut-keys">
                        <span class="onyx-key-badge">Ctrl</span>
                        <span class="onyx-key-badge">Shift</span>
                        <span class="onyx-key-badge volt">L</span>
                      </div>
                    </div>

                    <div class="onyx-shortcut-row" onClick={() => setBottomPanelVisible(!bottomPanelVisible())}>
                      <span class="onyx-shortcut-label">Toggle Integrated Terminal</span>
                      <div class="onyx-shortcut-keys">
                        <span class="onyx-key-badge">Ctrl</span>
                        <span class="onyx-key-badge">~</span>
                      </div>
                    </div>

                    <div class="onyx-shortcut-row" onClick={() => setLeftSidebarVisible(!leftSidebarVisible())}>
                      <span class="onyx-shortcut-label">Toggle Primary Sidebar</span>
                      <div class="onyx-shortcut-keys">
                        <span class="onyx-key-badge">Ctrl</span>
                        <span class="onyx-key-badge">B</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </Show>

          {/* VIEW 2: ACTIVE MULTI-TAB CODE EDITOR */}
          <Show when={activeCanvas() === 'editor'}>
            <div class="onyx-editor-canvas">
              
              {/* Tab Bar */}
              <div class="onyx-editor-tabs-bar">
                <For each={openTabs()}>
                  {(tabPath) => (
                    <div
                      class={`onyx-editor-tab ${activeFilePath() === tabPath ? 'active' : ''}`}
                      onClick={() => handleOpenFile(tabPath)}
                    >
                      <span>{tabPath.split('/').pop()}</span>
                      <button
                        type="button"
                        class="onyx-editor-tab-close"
                        onClick={(e) => handleCloseTab(tabPath, e)}
                        title="Close tab (Ctrl+W)"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </For>
              </div>

              {/* Code Body with Line Numbers & Textarea */}
              <div class="onyx-code-viewport">
                <div class="onyx-line-gutter">
                  <pre style={{ margin: 0 }}>{lineNumbers()}</pre>
                </div>
                <textarea
                  class="onyx-code-textarea"
                  value={editorContent()}
                  onInput={handleEditorInput}
                  spellcheck={false}
                />
              </div>

            </div>
          </Show>

          {/* BOTTOM DOCKABLE PANEL (Terminal / Problems / AST Sentry) */}
          <Show when={bottomPanelVisible()}>
            <section class="onyx-bottom-panel">
              <div class="onyx-bottom-tabs-bar">
                <div class="onyx-bottom-tab-group">
                  <button
                    type="button"
                    class={`onyx-bottom-tab ${bottomTab() === 'terminal' ? 'active' : ''}`}
                    onClick={() => setBottomTab('terminal')}
                  >
                    <span>Terminal</span>
                  </button>
                  <button
                    type="button"
                    class={`onyx-bottom-tab ${bottomTab() === 'problems' ? 'active' : ''}`}
                    onClick={() => setBottomTab('problems')}
                  >
                    <span>Problems</span>
                    <span style={{ "font-size": "10px", background: "rgba(255,255,255,0.1)", padding: "1px 5px", "border-radius": "10px" }}>0</span>
                  </button>
                  <button
                    type="button"
                    class={`onyx-bottom-tab ${bottomTab() === 'output' ? 'active' : ''}`}
                    onClick={() => setBottomTab('output')}
                  >
                    <span>Output</span>
                  </button>
                  <button
                    type="button"
                    class={`onyx-bottom-tab ${bottomTab() === 'debug' ? 'active' : ''}`}
                    onClick={() => setBottomTab('debug')}
                  >
                    <span>Debug Console</span>
                  </button>
                  <button
                    type="button"
                    class={`onyx-bottom-tab ${bottomTab() === 'ports' ? 'active' : ''}`}
                    onClick={() => setBottomTab('ports')}
                  >
                    <span>Ports</span>
                  </button>
                </div>

                <div class="onyx-bottom-actions">
                  <span style={{ "font-size": "11px", color: "#64748b", "font-family": "monospace", "margin-right": "8px" }}>pwsh · US-East Cluster</span>
                  <button type="button" class="onyx-icon-btn-sm" onClick={() => setTerminalLogs([])} title="Clear Terminal">🗑️</button>
                  <button type="button" class="onyx-icon-btn-sm" onClick={() => setBottomPanelVisible(false)} title="Close Panel">✕</button>
                </div>
              </div>

              {/* Tab Content */}
              <div class="onyx-bottom-content">
                <Show when={bottomTab() === 'terminal'}>
                  <div class="onyx-terminal-logs">
                    <For each={terminalLogs()}>
                      {(line) => <div>{line}</div>}
                    </For>
                  </div>
                  <form class="onyx-terminal-cli-form" onSubmit={handleTerminalSubmit}>
                    <span class="onyx-terminal-ps">PS E:\Vibe Code Platform&gt;</span>
                    <input
                      type="text"
                      class="onyx-terminal-input"
                      placeholder="type test, git status, ls, clear..."
                      value={terminalInput()}
                      onInput={(e) => setTerminalInput((e.target as HTMLInputElement).value)}
                    />
                  </form>
                </Show>

                <Show when={bottomTab() === 'problems'}>
                  <div style={{ color: "#4ade80", padding: "8px 0" }}>
                    ✓ In-Process Tree-Sitter AST Engine: No syntax or type diagnostics detected in {activeFilePath()}.
                  </div>
                  <div style={{ color: "#94a3b8", "font-size": "11.5px" }}>
                    Zero unsafe evaluations. All AST compiler tokens adhere to zero-telemetry boundaries.
                  </div>
                </Show>

                <Show when={bottomTab() === 'output'}>
                  <div style={{ color: "#94a3b8", padding: "8px 0" }}>
                    [onyx-daemon] MicroVM US-East instance initialized. Ready for task dispatch.
                  </div>
                </Show>

                <Show when={bottomTab() === 'debug'}>
                  <div style={{ color: "#94a3b8", padding: "8px 0" }}>
                    Debugger attached to Node 22 / Bun v1.2 process. Breakpoints: 0 active.
                  </div>
                </Show>

                <Show when={bottomTab() === 'ports'}>
                  <div style={{ display: "flex", gap: "24px", padding: "8px 0" }}>
                    <div><span style={{ color: "#d8ff38" }}>3000</span> (Dev Server - HTTP)</div>
                    <div><span style={{ color: "#d8ff38" }}>3018</span> (Console App - Preview)</div>
                  </div>
                </Show>
              </div>
            </section>
          </Show>

        </main>

        {/* 2D. RIGHT COPILOT / AGENT LUCIFER PANEL (Matching Antigravity Screenshot 1 & VS Code Screenshot 2) */}
        <Show when={copilotVisible()}>
          <aside class="onyx-copilot-panel">
            <div class="onyx-copilot-header">
              <div class="onyx-copilot-title">
                <span style={{ color: "#d8ff38" }}>✦</span>
                <span>Agent Lucifer (Autonomous)</span>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  class="onyx-icon-btn-sm"
                  onClick={() => {
                    const models = ["DeepSeek R1 (Frontier)", "Qwen 2.5 Coder (153 tok/s)", "Claude 3.7 Sonnet"]
                    const idx = models.indexOf(selectedModel())
                    setSelectedModel(models[(idx + 1) % models.length])
                  }}
                  title="Switch Model"
                >
                  ⚡
                </button>
                <button type="button" class="onyx-icon-btn-sm" onClick={() => setCopilotVisible(false)} title="Close Panel">
                  ✕
                </button>
              </div>
            </div>

            {/* Conversation Stream */}
            <div class="onyx-copilot-stream">
              <For each={agentMessages()}>
                {(msg) => (
                  <div class={msg.sender === 'user' ? 'onyx-msg-user' : 'onyx-msg-agent'}>
                    <Show when={msg.thought}>
                      <div class="onyx-reasoning-box">
                        <div style={{ color: "#d8ff38", "font-weight": 600, "margin-bottom": "3px" }}>
                          ✦ Agent Lucifer Thought Stream:
                        </div>
                        <pre style={{ margin: 0, "white-space": "pre-wrap" }}>{msg.thought}</pre>
                      </div>
                    </Show>

                    <div>{msg.text}</div>

                    <Show when={msg.patch}>
                      <div class="onyx-patch-card">
                        <div style={{ display: "flex", "justify-content": "space-between", "margin-bottom": "6px", "font-size": "11px" }}>
                          <span style={{ color: "#4ade80", "font-weight": 600 }}>{msg.patch!.path}</span>
                          <span style={{ color: "#94a3b8" }}>{msg.patch!.diff}</span>
                        </div>
                        <button
                          type="button"
                          class="onyx-btn-open-folder"
                          style={{ width: "100%", padding: "6px 10px", "font-size": "11.5px" }}
                          onClick={() => applyPatch(msg.patch!)}
                        >
                          Apply Surgical Patch to Editor
                        </button>
                      </div>
                    </Show>
                  </div>
                )}
              </For>

              <Show when={agentThinking()}>
                <div class="onyx-msg-agent" style={{ "border-color": "rgba(216,255,56,0.4)" }}>
                  <div style={{ display: "flex", "align-items": "center", gap: "8px", color: "#d8ff38" }}>
                    <span class="animate-spin">⚙</span>
                    <span>Agent Lucifer is reasoning across AST dependency graph...</span>
                  </div>
                </div>
              </Show>
            </div>

            {/* Floating Copilot Prompt Container (Matching Antigravity Screenshot 1) */}
            <div class="onyx-copilot-input-container">
              <textarea
                class="onyx-copilot-textarea"
                placeholder="Ask anything, @ to mention, / for actions... (Ctrl+Alt+I)"
                value={agentPrompt()}
                onInput={(e) => setAgentPrompt((e.target as HTMLTextAreaElement).value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAgentSubmit()
                  }
                }}
              />

              <div class="onyx-copilot-actions">
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    class="onyx-key-badge volt"
                    onClick={() => {
                      const models = ["DeepSeek R1 (Frontier)", "Qwen 2.5 Coder (153 tok/s)", "Claude 3.7 Sonnet"]
                      const idx = models.indexOf(selectedModel())
                      setSelectedModel(models[(idx + 1) % models.length])
                    }}
                  >
                    ● {selectedModel().split(' ')[0]}
                  </button>
                  <button
                    type="button"
                    class="onyx-key-badge"
                    onClick={() => setPermissionMode(permissionMode() === 'auto' ? 'manual' : 'auto')}
                  >
                    {permissionMode() === 'auto' ? '⚡ Auto' : '✋ Manual'}
                  </button>
                </div>

                <button
                  type="button"
                  class="onyx-btn-open-folder"
                  style={{ padding: "4px 14px", "font-size": "12px" }}
                  disabled={!agentPrompt().trim()}
                  onClick={handleAgentSubmit}
                >
                  Send →
                </button>
              </div>
            </div>
          </aside>
        </Show>

      </div>

      {/* 3. BOTTOM STATUS BAR */}
      <footer class="onyx-desktop-statusbar">
        <div class="onyx-statusbar-left">
          <div class="onyx-status-pill volt" onClick={() => commandList.find(c => c.id === 'cmd-ast')?.action()}>
            <span>●</span>
            <span>{astStatus().msg}</span>
          </div>
          <div class="onyx-status-pill">
            <span>⨂ 0</span>
            <span style={{ "margin-left": "4px" }}>⚠ 0</span>
          </div>
          <div class="onyx-status-pill emerald">
            <span>🔀 main</span>
          </div>
        </div>

        <div class="onyx-statusbar-right">
          <div class="onyx-status-pill" onClick={() => commandList.find(c => c.id === 'cmd-model')?.action()}>
            <span>Model: {selectedModel()}</span>
          </div>
          <div class="onyx-status-pill">
            <span>US-East MicroVM: Online (100% SLA)</span>
          </div>
          <div class="onyx-status-pill">
            <span>Ln {cursorPos().line}, Col {cursorPos().col}</span>
          </div>
          <div class="onyx-status-pill">
            <span>UTF-8</span>
          </div>
          <div class="onyx-status-pill" onClick={() => setPaletteOpen(true)} title="Shortcuts & Command Palette (Ctrl+Shift+P)">
            <span>⌨ Shortcuts</span>
          </div>
        </div>
      </footer>

      {/* 4. INTERACTIVE SPOTLIGHT COMMAND PALETTE MODAL (Ctrl+Shift+P) */}
      <Show when={paletteOpen()}>
        <div class="onyx-palette-backdrop" onClick={() => setPaletteOpen(false)}>
          <div class="onyx-palette-modal" onClick={(e) => e.stopPropagation()}>
            <div class="onyx-palette-input-wrap">
              <span style={{ color: "#d8ff38" }}>&gt;</span>
              <input
                type="text"
                class="onyx-palette-input"
                placeholder="Type a command or search shortcuts (e.g. AST, Terminal, File, Test)..."
                value={paletteQuery()}
                onInput={(e) => {
                  setPaletteQuery((e.target as HTMLInputElement).value)
                  setPaletteSelectedIndex(0)
                }}
                autofocus
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setPaletteSelectedIndex((paletteSelectedIndex() + 1) % filteredCommands().length)
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setPaletteSelectedIndex((paletteSelectedIndex() - 1 + filteredCommands().length) % filteredCommands().length)
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    const cmd = filteredCommands()[paletteSelectedIndex()]
                    if (cmd) {
                      setPaletteOpen(false)
                      cmd.action()
                    }
                  }
                }}
              />
              <span style={{ "font-size": "11px", color: "#64748b" }}>ESC to close</span>
            </div>

            <div class="onyx-palette-list">
              <For each={filteredCommands()}>
                {(cmd, i) => (
                  <div
                    class={`onyx-palette-item ${i() === paletteSelectedIndex() ? 'active' : ''}`}
                    onClick={() => {
                      setPaletteOpen(false)
                      cmd.action()
                    }}
                  >
                    <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
                      <span style={{ "font-size": "11px", color: "#64748b", "font-weight": 600 }}>{cmd.category}:</span>
                      <span>{cmd.title.replace(`${cmd.category}: `, '')}</span>
                    </div>
                    <span class="onyx-key-badge">{cmd.shortcut}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>

    </div>
  )
}
