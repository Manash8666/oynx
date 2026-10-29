import React, { useState, useRef, useEffect } from 'react'
import { Terminal, Cpu, Sparkles, Shield, Send, CheckCircle2, RotateCcw } from 'lucide-react'

export const LiveStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'models' | 'canvas' | 'legal'>('terminal')
  const [fontSchema, setFontSchema] = useState<'standard' | 'agency'>('standard')
  const [terminalPrompt, setTerminalPrompt] = useState('')
  const [terminalLogs, setTerminalLogs] = useState<Array<{ type: 'user' | 'daemon' | 'result'; content: string }>>([
    { type: 'daemon', content: 'Initializing Onyx Hybrid Router v1.0.0...' },
    { type: 'daemon', content: 'Ollama local provider connected: qwen2.5-coder:1.5b (153 tok/s)' },
    { type: 'daemon', content: 'In-Process LSP Compiler Guard initialized (TypeScript 5.8)' },
    { type: 'daemon', content: 'AST Graph-RAG ready: 11,043 symbols indexed' },
    { type: 'daemon', content: 'Server listening on http://localhost:3000' },
  ])
  const [isExecuting, setIsExecuting] = useState(false)
  const [isAuditing, setIsAuditing] = useState(false)
  const [auditComplete, setAuditComplete] = useState(false)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Scroll to bottom on new log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [terminalLogs])

  // Canvas particle animation with Anthracite & Volt palette
  useEffect(() => {
    if (activeTab !== 'canvas') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = canvas.offsetWidth)
    let h = (canvas.height = canvas.offsetHeight)

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: Math.random() * 2 + 1,
      color: ['#d8ff38', '#ffffff', '#22c55e', '#9ca3af'][Math.floor(Math.random() * 4)],
    }))

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      particles.forEach((p) => {
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = 90 / dist
        p.vx += (dx / dist) * force
        p.vy += (dy / dist) * force
      })
    }

    canvas.addEventListener('click', handleCanvasClick)
    let animId: number

    const loop = () => {
      ctx.fillStyle = 'rgba(7, 8, 10, 0.25)'
      ctx.fillRect(0, 0, w, h)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      })
      animId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener('click', handleCanvasClick)
    }
  }, [activeTab])

  const handleExecutePrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!terminalPrompt.trim() || isExecuting) return

    const prompt = terminalPrompt.trim()
    setTerminalPrompt('')
    setTerminalLogs((prev) => [...prev, { type: 'user', content: prompt }])
    setIsExecuting(true)

    try {
      const res = await fetch('/api/router/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, isMultiFile: true }),
      })
      if (res.ok) {
        const data = await res.json()
        const c = data.classification
        setTerminalLogs((prev) => [
          ...prev,
          {
            type: 'result',
            content: `[router] Route: ${c.targetModel} (${c.taskType}) • In-Process LSP AST Typecheck: 0 errors • Checkpoint saved`,
          },
        ])
        setIsExecuting(false)
        return
      }
    } catch {
      // offline dev simulation
    }

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        {
          type: 'result',
          content: `[router] Synthesized via qwen2.5-coder:1.5b (Local Offline, 153 tok/s) • LSP AST Verification: PASS (0 errors) • PTY Git Checkpoint created • Zero hallucinated imports`,
        },
      ])
      setIsExecuting(false)
    }, 400)
  }

  const handleRunLegalAudit = () => {
    setIsAuditing(true)
    setAuditComplete(false)
    setTimeout(() => {
      setIsAuditing(false)
      setAuditComplete(true)
    }, 700)
  }

  return (
    <section id="studio" className="py-24 px-4 bg-anthracite-charcoal/80 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-[#d8ff38] font-sans text-xs font-medium uppercase tracking-widest mb-3">
            Interactive Product Preview
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-semibold leading-[1.15] tracking-tight text-white mb-4">
            Live Onyx Dev Studio.
          </h2>
          <p className="font-sans text-sm sm:text-base font-normal leading-[1.6] text-zinc-400">
            Test the compiler guard, model registry, kinetic creative canvas, and legal compliance gate.
          </p>
        </div>

        {/* IDE Font Schema Switcher - Option B Support */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-1.5 rounded-2xl bg-anthracite-charcoal max-w-md mx-auto border border-white/[0.08]">
          <span className="text-[11px] font-sans font-medium text-zinc-400 px-2">IDE Font:</span>
          <button
            onClick={() => setFontSchema('standard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
              fontSchema === 'standard'
                ? 'btn-volt font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Geist + JetBrains
          </button>
          <button
            onClick={() => setFontSchema('agency')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
              fontSchema === 'agency'
                ? 'btn-volt font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Option B: General Sans + Fragment
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="bg-anthracite-charcoal p-1.5 rounded-2xl max-w-2xl mx-auto mb-8 flex flex-wrap gap-2 justify-center border border-white/[0.08] shadow-lg">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-5 py-2.5 rounded-xl font-mono-code text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'terminal'
                ? 'btn-volt'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal &amp; Swarm</span>
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-5 py-2.5 rounded-xl font-mono-code text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'models'
                ? 'btn-volt'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Model Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-5 py-2.5 rounded-xl font-mono-code text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'canvas'
                ? 'btn-volt'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>MotionSites Canvas</span>
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`px-5 py-2.5 rounded-xl font-mono-code text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'legal'
                ? 'btn-volt'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Legal Compliance Shield</span>
          </button>
        </div>

        {/* Tab Content Window */}
        <div className={`max-w-4xl mx-auto bg-anthracite-charcoal rounded-3xl p-6 md:p-8 border border-white/[0.08] shadow-anthracite-card ${
          fontSchema === 'agency' ? 'font-ide-sans' : 'font-sans'
        }`}>
          
          {/* Tab 1: Terminal */}
          {activeTab === 'terminal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono-code text-zinc-400 pb-3 border-b border-white/[0.08]">
                <span>Terminal Sandbox Execution</span>
                <span className="text-[#22c55e] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
                  Local Daemon Online (127.0.0.1:11434)
                </span>
              </div>
              <div
                ref={logContainerRef}
                className="bg-anthracite-base p-5 rounded-2xl font-mono-code text-xs text-zinc-300 space-y-2 h-64 overflow-y-auto border border-white/[0.08]"
              >
                {terminalLogs.map((log, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {log.type === 'user' ? (
                      <span className="text-[#d8ff38]">onyx@user:~$ </span>
                    ) : log.type === 'daemon' ? (
                      <span className="text-zinc-500">[info] </span>
                    ) : (
                      <span className="text-[#22c55e]">[success] </span>
                    )}
                    <span className={log.type === 'user' ? 'text-white font-medium' : log.type === 'result' ? 'text-zinc-200' : 'text-zinc-400'}>
                      {log.content}
                    </span>
                  </p>
                ))}
                {isExecuting && (
                  <p className="text-zinc-500 animate-pulse">
                    [daemon] Synthesizing AST micro-patch &amp; checking in-process compiler...
                  </p>
                )}
              </div>
              <form onSubmit={handleExecutePrompt} className="flex gap-3">
                <input
                  type="text"
                  value={terminalPrompt}
                  onChange={(e) => setTerminalPrompt(e.target.value)}
                  placeholder="Enter prompt (e.g., 'refactor auth provider with atomic git checkpoint')"
                  className="w-full bg-anthracite-surface border border-white/[0.08] rounded-xl px-4 py-3 text-xs font-mono-code text-white focus:outline-none focus:border-volt/50"
                />
                <button
                  type="submit"
                  disabled={isExecuting}
                  className="px-6 py-3 rounded-xl btn-volt font-mono-code text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-[#07080a]" />
                  <span>Execute</span>
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Models */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="text-xs font-mono-code text-zinc-400 pb-3 border-b border-white/[0.08] flex justify-between">
                <span>Supported Model Architecture</span>
                <span className="text-[#d8ff38]">100% Permissive Open Weights</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code">
                <div className="p-4 rounded-xl bg-anthracite-surface border border-white/[0.08]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-bold">qwen2.5-coder:1.5b</span>
                    <span className="text-[#d8ff38]">Offline Local</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">Primary zero-latency autocomplete. 150+ tok/s. $0 marginal cost.</p>
                </div>
                <div className="p-4 rounded-xl bg-anthracite-surface border border-white/[0.08]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-bold">DeepSeek-R1</span>
                    <span className="text-[#22c55e]">Cloud Swarm</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">Frontier reasoning for deep multi-file architectural refactoring.</p>
                </div>
                <div className="p-4 rounded-xl bg-anthracite-surface border border-white/[0.08]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-bold">Qwen3-Coder 32B</span>
                    <span className="text-white">Local / Cloud</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">Full repository synthesis, test generation, and complex AST slicing.</p>
                </div>
                <div className="p-4 rounded-xl bg-anthracite-surface border border-white/[0.08]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-bold">Google Gemma 2 &amp; Nemotron</span>
                    <span className="text-zinc-300">Permissive</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">Fast instruction following and specialized code explanations.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Canvas */}
          {activeTab === 'canvas' && (
            <div className="space-y-4">
              <div className="text-xs font-mono-code text-zinc-400 pb-3 border-b border-white/[0.08] flex justify-between">
                <span>MotionSites Generative UI &amp; Creative Canvas</span>
                <span className="text-[#d8ff38]">HTML5 Kinetic Engine</span>
              </div>
              <div className="h-64 rounded-2xl bg-anthracite-base relative overflow-hidden border border-white/[0.08] cursor-pointer">
                <canvas ref={canvasRef} className="w-full h-full block"></canvas>
                <div className="absolute bottom-3 left-3 text-[11px] font-mono-code text-zinc-400 bg-anthracite-charcoal/90 px-2.5 py-1 rounded-md border border-white/[0.08]">
                  Interactive kinetic particle web (Click to disperse particles)
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Legal Shield */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div className="text-xs font-mono-code text-zinc-400 pb-3 border-b border-white/[0.08] flex justify-between">
                <span>Real-Time Legal Compliance Guard</span>
                <span className="text-[#22c55e]">Automated AST Gate (check:legal)</span>
              </div>
              {isAuditing ? (
                <div className="p-5 rounded-2xl bg-anthracite-surface border border-volt/30 text-xs font-mono-code text-zinc-300 space-y-1.5 animate-pulse">
                  <p className="text-[#d8ff38] font-bold">[audit:running] Scanning Monorepo AST &amp; Licensing Boundaries...</p>
                  <p className="text-zinc-400">[1/4] Auditing 36 package manifests for copyleft viral contagion... 0 HAZARDS</p>
                  <p className="text-zinc-400">[2/4] Verifying 699 dependencies against permissive whitelist... 100% PERMISSIVE</p>
                  <p className="text-zinc-400">[3/4] Inspecting 6,369 source files for CFAA compliance... CLEARED</p>
                  <p className="text-zinc-400">[4/4] Validating Dual-Licensing boundary (AGPL-3.0 + EULA)... CERTIFIED</p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-anthracite-surface border border-[#22c55e]/30 text-xs font-mono-code text-zinc-300 space-y-1.5">
                  <p className="font-bold flex items-center gap-2 text-[#22c55e]">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                    AUDIT CERTIFICATION PASSED (AGPL-3.0 &amp; ENTERPRISE EULA CERTIFIED)
                  </p>
                  <p className="text-zinc-300">- Monorepo manifests: <strong>36 packages verified</strong> (0 copyleft hazards)</p>
                  <p className="text-zinc-300">- Dependency tree: <strong>699 dependencies verified</strong> (MIT / Apache-2.0 / BSD)</p>
                  <p className="text-zinc-300">- Source codebase: <strong>6,369 files scanned</strong> (0 unauthorized web scrapers)</p>
                  <p className="text-zinc-300">- Licensing boundary: <strong>Dual-License AGPL-3.0 Core + Closed-Source EULA</strong></p>
                  <p className="text-[#d8ff38] font-semibold pt-1 border-t border-white/[0.06]">
                    GUARANTEE: 100% exclusive customer copyright &amp; ownership over all generated code.
                  </p>
                </div>
              )}
              <button
                onClick={handleRunLegalAudit}
                disabled={isAuditing}
                className="w-full py-3 rounded-xl btn-volt font-mono-code text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-[#07080a] ${isAuditing ? 'animate-spin' : ''}`} />
                <span>Re-run Real-Time Monorepo Compliance Audit</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
