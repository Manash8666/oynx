import React, { useState } from 'react'
import { Terminal, Shield, Zap, ArrowRight, Copy, Check, Sparkles, Download, Layers, Monitor, Cpu, Laptop, Box, RefreshCw } from 'lucide-react'
import { GithubIcon } from './icons'

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'compiler' | 'swarm' | 'terminal'>('compiler')
  const [installOs, setInstallOs] = useState<'windows' | 'posix'>('windows')

  const installCmd = installOs === 'windows'
    ? 'irm https://oynx.si/install.ps1 | iex'
    : 'curl -fsSL https://oynx.si/install.sh | sh'

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const platforms = [
    { name: 'VS Code', desc: 'Native .vsix for VS Code, Cursor & Windsurf', badge: 'Ready', icon: Box, active: true, href: '/download/onyx-code-1.0.0.vsix' },
    { name: 'Terminal CLI', desc: 'Run autonomous agent in any shell or CI', badge: 'Active', icon: Terminal, active: true, href: '/download/onyx-windows-x64.zip' },
    { name: 'Desktop App', desc: 'Standalone IDE with live preview sandbox', badge: 'v1.0', icon: Monitor, active: true, href: '/download/onyx-windows-x64.exe' },
    { name: 'Local Ollama', desc: '153 tok/s GPU inference with zero data egress', badge: '100% Offline', icon: Cpu, active: true, href: '#byoai' },
    { name: 'Agent Swarms', desc: 'Autonomous planner, coder & sentry swarm', badge: 'Multi-Agent', icon: Layers, active: true, href: '#live-studio' },
    { name: 'MotionSites', desc: '70 Living Hero WebGL shaders & UI templates', badge: '70 Templates', icon: Sparkles, active: true, href: '/templates' },
  ]

  return (
    <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-3 sm:px-6 lg:px-8 relative overflow-hidden grid-lines w-full max-w-full">
      {/* Ambient Volt / Electric Lime Radial Glow Backdrop */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-[700px] h-[350px] sm:h-[450px] radial-glow-volt pointer-events-none -z-10"></div>

      <div className="max-w-6xl mx-auto flex flex-col items-center text-center w-full">

        {/* Eyebrow Announcement Pill & Retina Ready Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 w-full max-w-full">
          <div className="inline-flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1.5 rounded-2xl sm:rounded-full bg-anthracite-charcoal border border-white/[0.08] text-zinc-300 font-sans text-xs font-medium tracking-micro shadow-sm max-w-full">
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#d8ff38] animate-pulse"></span>
              <span className="text-[#d8ff38] font-bold">AGENT LUCIFER:</span>
            </span>
            <span className="text-center sm:text-left text-[11px] sm:text-xs text-zinc-300">
              Quad-Cortex AI Agent (DeepSeek R1 + Qwen 2.5 + Nemotron) • 100% Customer IP
            </span>
          </div>
          <a
            href="/retina-ready"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#0e1713] border border-[#22c55e]/30 text-[11px] sm:text-xs font-mono text-[#4ade80] hover:bg-[#13221b] hover:border-[#22c55e]/60 transition-colors shadow-sm shrink-0"
            title="Calibrated for Apple Retina, 4K, 5K and 6K Pro Display XDR"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="font-semibold tracking-wide">RETINA 4K/5K READY</span>
          </a>
        </div>

        {/* High-Impact Centered Hero Title (Geist font-bold tracking-tighter leading-[1.05]) */}
        <h1 className="font-sans text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight sm:tracking-tighter text-white max-w-5xl leading-[1.12] sm:leading-[1.05] mb-5 sm:mb-6 text-balance break-words">
          The Autonomous AI IDE <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-zinc-200 to-[#d8ff38] bg-clip-text text-transparent">
            You Actually Own.
          </span>
        </h1>

        {/* Lead Text (Geist text-lg font-normal leading-[1.5] tracking-lead) */}
        <p className="font-sans text-sm sm:text-base md:text-lg font-normal leading-[1.55] sm:leading-[1.5] tracking-lead text-zinc-400 max-w-3xl mb-8 sm:mb-10 text-balance px-1">
          Stop paying 300% SaaS markups and receiving broken code. Powered by <strong className="text-white font-medium">Agent Lucifer Quad-Cortex</strong>, Onyx harmonizes{' '}
          <strong className="text-white font-medium">DeepSeek AST reasoning</strong>,{' '}
          <strong className="text-white font-medium">Qwen multimodal UI</strong>,{' '}
          <strong className="text-white font-medium">Nemotron PRM verification</strong>, and{' '}
          <strong className="text-white font-medium">AlgoTraders quant finance</strong> with an in-process Tree-Sitter compiler guard and a 100% customer IP guarantee.
        </p>

        {/* Primary Call-to-Action Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-4 w-full sm:w-auto max-w-full">
          <a
            href="https://app.oynx.si/cloud-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl btn-volt text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-volt-glow transition-all group"
          >
            <Sparkles className="w-4 h-4 text-[#07080a] group-hover:scale-110 transition-transform" />
            <span>Launch Cloud IDE (Agent Lucifer)</span>
          </a>

          <a
            href="/download/onyx-windows-x64.exe"
            download="onyx-windows-x64.exe"
            className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-anthracite-charcoal hover:bg-anthracite-elevated border border-white/[0.12] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all group"
          >
            <Download className="w-4 h-4 text-[#d8ff38] group-hover:translate-y-0.5 transition-transform" />
            <span>Windows Installer (.exe)</span>
          </a>

          {/* Quick Install Copy Pill with OS Selector */}
          <div className="w-full sm:w-auto flex items-center justify-between bg-anthracite-charcoal rounded-xl border border-white/[0.08] px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs font-mono-code text-zinc-300 shadow-sm gap-2 max-w-full overflow-hidden">
            <div className="flex items-center gap-1 bg-anthracite-surface p-0.5 rounded-lg border border-white/[0.04] shrink-0">
              <button
                type="button"
                onClick={() => setInstallOs('windows')}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-sans transition-colors ${installOs === 'windows' ? 'bg-[#d8ff38] text-[#07080a] font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
              >
                Win
              </button>
              <button
                type="button"
                onClick={() => setInstallOs('posix')}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-sans transition-colors ${installOs === 'posix' ? 'bg-[#d8ff38] text-[#07080a] font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
              >
                mac/sh
              </button>
            </div>
            <span className="text-[#d8ff38] font-bold shrink-0">$</span>
            <span className="text-zinc-200 select-all text-[10px] sm:text-[11px] truncate">{installCmd}</span>
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded-lg bg-anthracite-surface hover:bg-anthracite-elevated text-zinc-300 hover:text-white transition-colors flex items-center gap-1 shrink-0 border border-white/[0.06]"
              title="Copy install command"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden xs:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <a
            href="https://github.com/Manash8666/oynx.git"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-anthracite-surface hover:bg-anthracite-elevated text-white font-semibold text-xs border border-white/[0.08] hover:border-volt/40 transition-all flex items-center justify-center gap-2"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>

      {/* Secondary Download Direct Links */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 mb-10 font-mono-code">
        <span className="text-zinc-500">Fast Downloads:</span>
        <a href="/download/onyx-windows-x64.zip" download="onyx-windows-x64.zip" className="text-zinc-300 hover:text-[#d8ff38] transition-colors underline underline-offset-4">
          Windows (.zip portable)
        </a>
        <span className="text-zinc-700">•</span>
        <a href="/download/onyx-code-1.0.0.vsix" download="onyx-code-1.0.0.vsix" className="text-zinc-300 hover:text-[#d8ff38] transition-colors underline underline-offset-4">
          VS Code Extension (.vsix)
        </a>
        <span className="text-zinc-700">•</span>
        <a href="/templates" target="_blank" rel="noopener noreferrer" className="text-[#d8ff38] hover:underline underline-offset-4 flex items-center gap-1">
          <span>70 Living Hero UI Templates</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* Use Onyx Everywhere - Platform Availability Bento Grid */}
      <div id="platforms" className="w-full max-w-6xl mt-2 mb-14 text-left">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-xs uppercase font-mono-code tracking-wider text-zinc-400">
            Use Onyx Everywhere You Code
          </span>
          <span className="text-xs font-mono-code text-[#d8ff38]">
            No Cloud Lock-in • BYOK &amp; Local GPU
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {platforms.map((p, idx) => {
            const Icon = p.icon
            return (
              <a
                key={idx}
                href={p.href || '#'}
                className={`p-4 rounded-xl anthracite-card border transition-all block ${p.active
                    ? 'border-white/[0.08] hover:border-volt/40 hover:bg-anthracite-elevated cursor-pointer'
                    : 'border-white/[0.04] opacity-60'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-[#d8ff38]" />
                  <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-anthracite-surface text-zinc-300 border border-white/[0.06]">
                    {p.badge}
                  </span>
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">{p.name}</h4>
                <p className="text-[11px] text-zinc-400 leading-tight">{p.desc}</p>
              </a>
            )
          })}
        </div>
      </div>

      {/* Clean Developer IDE Product Window Preview */}
      <div className="w-full max-w-5xl bg-anthracite-charcoal rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl text-left">

        {/* macOS Window Controls & Tabs Bar */}
        <div className="bg-anthracite-surface/90 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/[0.08] flex items-center justify-between gap-3 text-xs font-mono-code overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ef4444]"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#eab308]"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#22c55e]"></div>
            </div>
            <div className="flex items-center gap-1 ml-1 sm:ml-2 shrink-0">
              <button
                onClick={() => setActiveTab('compiler')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs transition-colors shrink-0 ${activeTab === 'compiler'
                    ? 'bg-anthracite-charcoal text-[#d8ff38] font-semibold border border-white/[0.08]'
                    : 'text-zinc-400 hover:text-white'
                  }`}
              >
                compiler-guard.ts
              </button>
              <button
                onClick={() => setActiveTab('swarm')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs transition-colors shrink-0 ${activeTab === 'swarm'
                    ? 'bg-anthracite-charcoal text-[#d8ff38] font-semibold border border-white/[0.08]'
                    : 'text-zinc-400 hover:text-white'
                  }`}
              >
                agent-swarm.ts
              </button>
              <button
                onClick={() => setActiveTab('terminal')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs transition-colors shrink-0 ${activeTab === 'terminal'
                    ? 'bg-anthracite-charcoal text-[#d8ff38] font-semibold border border-white/[0.08]'
                    : 'text-zinc-400 hover:text-white'
                  }`}
              >
                live-pty.log
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
            <span className="text-[#22c55e] font-medium text-[10px] sm:text-[11px] whitespace-nowrap">0 Diagnostics • AST Clean</span>
          </div>
        </div>

        {/* Interactive Code & Output Area */}
        <div className="p-6 font-mono-code text-xs bg-anthracite-base overflow-x-auto text-zinc-300 space-y-2">
          {activeTab === 'compiler' && (
            <>
              <p className="text-zinc-500">// Onyx In-Process LSP Verification Loop (Zero-Broken-Code Guarantee)</p>
              <p><span className="text-[#d8ff38]">import</span> &#123; <span className="text-white">LspCompilerGuard</span> &#125; <span className="text-[#d8ff38]">from</span> <span className="text-zinc-300">'@onyx/core/lsp'</span></p>
              <p><span className="text-[#d8ff38]">import</span> &#123; <span className="text-white">PtyGitCheckpoint</span> &#125; <span className="text-[#d8ff38]">from</span> <span className="text-zinc-300">'@onyx/core/terminal'</span></p>
              <p className="pt-2"><span className="text-[#d8ff38]">export async function</span> <span className="text-white font-semibold">applySynthesizedPatch</span>(patch: <span className="text-[#22c55e]">AstMicroPatch</span>) &#123;</p>
              <p className="pl-4 text-zinc-400">// 1. Pre-verify in-memory before writing physical disk</p>
              <p className="pl-4"><span className="text-[#d8ff38]">const</span> diagnostics = <span className="text-[#d8ff38]">await</span> LspCompilerGuard.<span className="text-white">verifyAstNode</span>(patch.ast)</p>
              <p className="pl-4"><span className="text-[#d8ff38]">if</span> (diagnostics.length &gt; 0) &#123;</p>
              <p className="pl-8"><span className="text-[#d8ff38]">return await</span> SelfHealingRuntime.<span className="text-white">autoCorrect</span>(diagnostics, patch)</p>
              <p className="pl-4">&#125;</p>
              <p className="pl-4 text-zinc-400">// 2. Create reversible atomic git checkpoint</p>
              <p className="pl-4"><span className="text-[#d8ff38]">const</span> checkpoint = <span className="text-[#d8ff38]">await</span> PtyGitCheckpoint.<span className="text-white">snapshot</span>(patch.summary)</p>
              <p className="pl-4"><span className="text-[#d8ff38]">return</span> &#123; success: <span className="text-[#22c55e]">true</span>, checkpointId: checkpoint.hash, latencyMs: <span className="text-[#d8ff38]">14</span> &#125;</p>
              <p>&#125;</p>
            </>
          )}

          {activeTab === 'swarm' && (
            <>
              <p className="text-zinc-500">// Autonomous Multi-Agent Swarm Coordinator</p>
              <p><span className="text-[#d8ff38]">const</span> swarm = <span className="text-[#d8ff38]">new</span> <span className="text-white">AgentSwarmCoordinator</span>(&#123;</p>
              <p className="pl-4">planner: <span className="text-zinc-300">'deepseek-r1-reasoning'</span>, <span className="text-zinc-500">// Architectural Blueprint</span></p>
              <p className="pl-4">coder: <span className="text-zinc-300">'qwen2.5-coder:1.5b-local'</span>, <span className="text-zinc-500">// 153 tok/s Air-Gapped Local</span></p>
              <p className="pl-4">sentry: <span className="text-zinc-300">'onyx-ast-guard'</span>, <span className="text-zinc-500">// Zero Broken Imports</span></p>
              <p>&#125;)</p>
              <p className="pt-2"><span className="text-[#22c55e]">✓ Swarm initialized.</span> 4 agents ready with isolated context sandboxes.</p>
            </>
          )}

          {activeTab === 'terminal' && (
            <>
              <p><span className="text-[#d8ff38]">[ast:patch]</span> Synthesizing surgical micro-patch for <code className="text-zinc-200 bg-anthracite-surface px-1.5 py-0.5 rounded">packages/core/src/runtime.ts</code></p>
              <p><span className="text-[#22c55e]">[lsp:verify]</span> In-process TypeScript 5.8 compiler invoked: <span className="text-[#22c55e]">0 diagnostics (AST clean)</span></p>
              <p><span className="text-zinc-400">[graph:rag]</span> Calculating topological ripple: <span className="text-zinc-300">3 dependent modules verified</span></p>
              <p><span className="text-zinc-400">[pty:guard]</span> Checkpoint created: <span className="text-zinc-300">commit_7d9e4a (1-click atomic rollback ready)</span></p>
              <p className="text-zinc-400 pt-2 border-t border-white/[0.06]"><span className="text-[#22c55e] font-semibold">✓ Patch committed to disk</span> in 14ms with zero broken imports.</p>
            </>
          )}
        </div>

        {/* Terminal Footer Strip */}
        <div className="bg-anthracite-charcoal px-4 py-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono-code text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-[#d8ff38]">$</span>
            <span>onyx status --live</span>
          </div>
          <span className="text-zinc-400">qwen2.5-coder:1.5b (Local GPU • 153 tok/s)</span>
        </div>

      </div>

    </div>
    </section >
  )
}
