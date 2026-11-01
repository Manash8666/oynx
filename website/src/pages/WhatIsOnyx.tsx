import React, { useState } from 'react'
import {
  Shield,
  Zap,
  Terminal,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Download,
  Lock,
  Layers,
  Sparkles,
  Server,
  DollarSign,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Play
} from 'lucide-react'
import { OnyxLogo, GithubIcon } from '../components/icons'

export const WhatIsOnyx: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'ast' | 'workbench' | 'auth' | 'installer'>('cloud')
  const [devCount, setDevCount] = useState<number>(30)

  // Calculations for Enterprise ROI
  const traditionalCost = devCount * 20 * 12 + devCount * 70 * 12 // $20 seat + $70 heavy token markup /mo
  const onyxCost = devCount * 18 * 12 // raw wholesale token cost only
  const annualSavings = traditionalCost - onyxCost

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a] pt-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center pt-8 pb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12161f] border border-[#d8ff38]/30 text-xs font-mono text-[#d8ff38] mb-8 shadow-sm animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#d8ff38]" />
          <span>COMMERCIAL ENTERPRISE EXECUTIVE BRIEFING</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.08] mb-6">
          What is <span className="text-[#d8ff38]">Onyx</span>? <br />
          <span className="text-zinc-400 font-medium text-3xl sm:text-5xl lg:text-6xl">
            The Autonomous AI Engineering Studio Built for Enterprise Scale.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          Eliminate the 300% SaaS markup on tokens, guarantee 100% intellectual property ownership, and prevent broken code with real-time in-process AST compiler verification.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <a
            href="https://app.oynx.si/cloud-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#d8ff38] hover:bg-[#cbf52b] text-[#07080a] font-bold text-sm transition-all shadow-[0_0_25px_rgba(216,255,56,0.25)] hover:shadow-[0_0_35px_rgba(216,255,56,0.4)]"
          >
            <span>Launch Cloud Agent</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="/download/onyx-windows-x64.exe"
            download="onyx-windows-x64.exe"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#12151d] hover:bg-[#181d28] text-white border border-white/[0.12] hover:border-white/[0.25] font-semibold text-sm transition-all"
          >
            <Download className="w-4 h-4 text-[#d8ff38]" />
            <span>Download NVIDIA-Style Installer (.exe)</span>
          </a>

          <a
            href="#demo-script"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-transparent hover:bg-white/[0.04] text-zinc-300 font-medium text-sm transition-all border border-transparent hover:border-white/[0.08]"
          >
            <Play className="w-4 h-4 text-[#22c55e]" />
            <span>5-Minute Client Demo Script</span>
          </a>
        </div>

        {/* Enterprise Compliance Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-zinc-400">
          <div className="px-3 py-1.5 rounded-lg bg-[#0e1218] border border-white/[0.08] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span>100% Source Code Ownership</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0e1218] border border-white/[0.08] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d8ff38]" />
            <span>Zero-Marginal-Cost BYOAI</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0e1218] border border-white/[0.08] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
            <span>In-Process AST Verification</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0e1218] border border-white/[0.08] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
            <span>Air-Gapped Private VPC Ready</span>
          </div>
        </div>
      </section>

      {/* 2. THE THREE PROBLEMS ONYX SOLVES */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-mono tracking-widest text-[#d8ff38] font-bold mb-3">
            MARKET PROBLEM &amp; THE ONYX MOAT
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Why IT Founders &amp; SaaS Owners Are Replacing Closed AI IDEs
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base">
            First-generation AI tools (Cursor, Copilot, Windsurf) act as middlemen. Onyx gives your organization the entire factory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: The SaaS Tax */}
          <div className="p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08] hover:border-[#d8ff38]/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#1b2212] border border-[#d8ff38]/30 flex items-center justify-center text-[#d8ff38] mb-6">
              <DollarSign className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3 group-hover:text-[#d8ff38] transition-colors">
              The 300% SaaS Margin Markup
            </h4>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Commercial AI IDEs charge $20-$40 per developer plus an exorbitant markup on heavy token usage. When agents run autonomous overnight jobs, costs balloon unpredictably.
            </p>
            <div className="p-3 rounded-lg bg-[#11141d] border border-white/[0.04] text-xs font-mono text-[#22c55e]">
              ✓ Onyx BYOAI: Direct API connectivity with $0 broker markup.
            </div>
          </div>

          {/* Card 2: Code Privacy & IP Leakage */}
          <div className="p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08] hover:border-[#22c55e]/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#122418] border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3 group-hover:text-[#22c55e] transition-colors">
              IP Leakage &amp; Compliance Risk
            </h4>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Enterprise companies in finance, healthcare, and SaaS cannot legally route confidential codebase context through 3rd-party multitenant SaaS proxies.
            </p>
            <div className="p-3 rounded-lg bg-[#11141d] border border-white/[0.04] text-xs font-mono text-[#22c55e]">
              ✓ Onyx: 100% self-hostable in your private VPC with zero telemetry.
            </div>
          </div>

          {/* Card 3: Broken Syntax & Hallucinations */}
          <div className="p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08] hover:border-[#38bdf8]/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#10202c] border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3 group-hover:text-[#38bdf8] transition-colors">
              The AI Hallucination Loop
            </h4>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Standard AI coding extensions guess code completions without verifying compiler validity. One missing import or invalid method breaks the team's build.
            </p>
            <div className="p-3 rounded-lg bg-[#11141d] border border-white/[0.04] text-xs font-mono text-[#22c55e]">
              ✓ Onyx: In-process Tree-Sitter AST parser catches syntax errors instantly.
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE WORKING FEATURES MATRIX */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-mono tracking-widest text-[#d8ff38] font-bold mb-3">
            LIVE OPERATIONAL CAPABILITIES
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            What Works in Onyx Right Now
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base">
            Every component below is fully engineered, compiled, tested, and operational in production.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'cloud'
                ? 'bg-[#d8ff38] text-[#07080a] shadow-[0_0_15px_rgba(216,255,56,0.3)]'
                : 'bg-[#12151d] text-zinc-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            1. Agent Lucifer &amp; Cloud IDE
          </button>
          <button
            onClick={() => setActiveTab('ast')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'ast'
                ? 'bg-[#d8ff38] text-[#07080a] shadow-[0_0_15px_rgba(216,255,56,0.3)]'
                : 'bg-[#12151d] text-zinc-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            2. In-Process AST Compiler
          </button>
          <button
            onClick={() => setActiveTab('workbench')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'workbench'
                ? 'bg-[#d8ff38] text-[#07080a] shadow-[0_0_15px_rgba(216,255,56,0.3)]'
                : 'bg-[#12151d] text-zinc-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            3. Cloud Workbench &amp; Sonic Studio
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'auth'
                ? 'bg-[#d8ff38] text-[#07080a] shadow-[0_0_15px_rgba(216,255,56,0.3)]'
                : 'bg-[#12151d] text-zinc-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            4. Multi-Provider Enterprise SSO
          </button>
          <button
            onClick={() => setActiveTab('installer')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'installer'
                ? 'bg-[#d8ff38] text-[#07080a] shadow-[0_0_15px_rgba(216,255,56,0.3)]'
                : 'bg-[#12151d] text-zinc-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            5. NVIDIA-Style Retina Installer
          </button>
        </div>

        {/* Feature Detail Showcase Box */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#0b0e14] border border-white/[0.1] shadow-2xl">
          {activeTab === 'cloud' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#162e24] text-[#22c55e] text-xs font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                  <span>ONLINE AT APP.OYNX.SI/CLOUD-AGENT</span>
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">
                  Agent Lucifer Quad-Cortex &amp; Autonomous Cloud IDE Fleet
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Engineers dispatch tasks to Agent Lucifer in isolated microVMs without keeping a laptop open. Harmonizes DeepSeek R1 AST compiler protection, Qwen 2.5 multimodal UI &amp; Sonic DAW, Nemotron PRM step verification, and AlgoTraders quant finance &amp; Olympiad math.
                </p>
                <ul className="space-y-3 text-sm text-zinc-300 font-sans mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Quad-Cortex Hyper-Model: DeepSeek + Qwen + Nemotron PRM + AlgoTraders</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Nemotron PRM Step Verification: Intermediate step scoring &amp; automated self-heal backtracking</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>AlgoTraders Quant Studio &amp; Olympiad Math: TA-Lib RSI/MACD, Sharpe backtesting &amp; LaTeX derivations</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Direct Git URL ingestion with branch targeting (`main`, `feature/..`)</span>
                  </li>
                </ul>
                <a
                  href="https://app.oynx.si/cloud-agent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d8ff38] text-[#07080a] font-bold text-xs hover:bg-[#cbf52b] transition-all"
                >
                  <span>Open Live Cloud Agent</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="p-6 rounded-xl bg-[#07080a] border border-white/[0.08] font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-500 pb-3 border-b border-white/[0.06] mb-4">
                  <span>DISPATCH TELEMETRY LOG</span>
                  <span className="text-[#22c55e]">CONNECTED</span>
                </div>
                <div className="space-y-2 text-zinc-400">
                  <p className="text-zinc-500"># Cloud Agent Task Dispatch</p>
                  <p><span className="text-[#38bdf8]">repo:</span> https://github.com/Manash8666/oynx.git</p>
                  <p><span className="text-[#38bdf8]">branch:</span> main</p>
                  <p><span className="text-[#38bdf8]">model:</span> anthropic/claude-3-7-sonnet</p>
                  <p className="text-[#22c55e]">✓ MicroVM provisioned in US-East (120ms)</p>
                  <p className="text-[#22c55e]">✓ Cloned 42 files into virtual worktree</p>
                  <p className="text-[#d8ff38]">⚡ AST parser verified syntax across 3 TypeScript files</p>
                  <p className="text-white">● Task status: Ready for merge review</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ast' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#162e24] text-[#22c55e] text-xs font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span>EMBEDDED IN ONYX.EXE</span>
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">
                  In-Process Tree-Sitter AST Compiler
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Most AI tools paste strings into files blindly. Onyx embeds a high-performance 37-language Tree-Sitter compiler inside its native binary. Every AI mutation is parsed into an abstract syntax tree and validated before touching your disk.
                </p>
                <ul className="space-y-3 text-sm text-zinc-300 font-sans mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>37 WebAssembly language grammars (TS, Go, Rust, Python, C++, etc.)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Zero-hallucination verification prevents broken commits</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Sub-millisecond incremental re-parsing during agent execution</span>
                  </li>
                </ul>
                <div className="text-xs font-mono text-zinc-400">
                  Binary footprint: <span className="text-[#d8ff38]">327 MB Unified Single Executable</span>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-[#07080a] border border-white/[0.08] font-mono text-xs">
                <div className="text-zinc-500 pb-3 border-b border-white/[0.06] mb-4">
                  AST VALIDATION ENGINE (TREE-SITTER)
                </div>
                <div className="space-y-2 text-zinc-400">
                  <p className="text-[#eab308]">! AI proposed change: auth_token_verifier.ts</p>
                  <p className="text-zinc-500">&gt; Building syntax tree (TSX grammar)...</p>
                  <p className="text-red-400">✕ Syntax violation caught: missing closing bracket at line 44</p>
                  <p className="text-[#38bdf8]">&gt; In-memory auto-correcting syntax tree...</p>
                  <p className="text-[#22c55e]">✓ AST tree structurally valid (0 errors)</p>
                  <p className="text-white">✓ Patch applied cleanly to working tree</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workbench' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#162e24] text-[#22c55e] text-xs font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span>ONLINE AT APP.OYNX.SI/CLOUD-AGENT</span>
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">
                  Cloud Workbench, Component Registry &amp; Sonic Studio
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  A high-productivity browser-based IDE designed for autonomous execution and pair-programming. Features interactive AST Code Guardian, accessible component tokens, and Sonic Studio audio track sequencing.
                </p>
                <ul className="space-y-3 text-sm text-zinc-300 font-sans mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Three-panel IDE layout: File Tree, Syntax Editor, and Multi-Tab Terminal</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Agent Lucifer toggle: Dual-Cortex, AST Guardian, UI Studio, Sonic Engine</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>In-IDE Sonic Studio 4-track step sequencer &amp; accessible UI registry</span>
                  </li>
                </ul>
                <a
                  href="https://app.oynx.si/cloud-agent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d8ff38] text-[#07080a] font-bold text-xs hover:bg-[#cbf52b] transition-all"
                >
                  <span>Launch Cloud IDE Workbench</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="p-6 rounded-xl bg-[#07080a] border border-white/[0.08] font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-500 pb-3 border-b border-white/[0.06] mb-4">
                  <span>WORKBENCH INSPECTOR</span>
                  <span className="text-[#d8ff38]">ACTIVE SESSION</span>
                </div>
                <div className="space-y-2 text-zinc-400">
                  <p className="text-zinc-500"># Active Workspace: /workspace/oynx-core</p>
                  <p>📁 src/engine/ast.ts <span className="text-[#22c55e]">(clean)</span></p>
                  <p>📁 src/routes/auth.ts <span className="text-[#38bdf8]">(modified +42, -3)</span></p>
                  <p>📁 tests/e2e/login.spec.ts <span className="text-[#22c55e]">(passed 14/14)</span></p>
                  <p className="text-[#22c55e]">✓ Test suite green · Memory usage: 142MB</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#162e24] text-[#22c55e] text-xs font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span>ONLINE AT APP.OYNX.SI/LOGIN</span>
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">
                  Enterprise Multi-Provider SSO Gateway
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Enterprise adoption requires flexible identity management. Onyx features a production-ready, distraction-free authentication gateway supporting major corporate providers.
                </p>
                <ul className="space-y-3 text-sm text-zinc-300 font-sans mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Google Workspace Enterprise SSO</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>GitHub OAuth2 with developer identity mapping</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Claude / Anthropic Direct Identity delegation</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Corporate &amp; Organization Email Magic SSO</span>
                  </li>
                </ul>
                <a
                  href="https://app.oynx.si/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d8ff38] text-[#07080a] font-bold text-xs hover:bg-[#cbf52b] transition-all"
                >
                  <span>View Login Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="p-6 rounded-xl bg-[#07080a] border border-white/[0.08] font-mono text-xs">
                <div className="text-zinc-500 pb-3 border-b border-white/[0.06] mb-4">
                  AUTHENTICATION AUDIT LOG
                </div>
                <div className="space-y-2 text-zinc-400">
                  <p className="text-zinc-500"># Auth Handshake Trace</p>
                  <p><span className="text-[#38bdf8]">provider:</span> Google Workspace / GitHub / SAML</p>
                  <p><span className="text-[#38bdf8]">session_token:</span> sec_jwt_9948fa.. (HMAC SHA-256)</p>
                  <p className="text-[#22c55e]">✓ Organization verified: Enterprise Dev Tier</p>
                  <p className="text-[#22c55e]">✓ Handover redirected to /profile</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'installer' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#162e24] text-[#22c55e] text-xs font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span>WINDOWS X64 PRODUCTION BINARY</span>
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">
                  NVIDIA-Inspired HD Retina Windows Installer
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Say goodbye to ugly MS-DOS command prompts. Onyx delivers a premium, hardware-accelerated Windows installer inspired by NVIDIA's driver suite: wide obsidian glass window, vertical 5-step stepper, animated volt progress, and live feature spotlight carousel.
                </p>
                <ul className="space-y-3 text-sm text-zinc-300 font-sans mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Per-Monitor V2 High-DPI declaration (razor-sharp on 4K, 2K, 150%)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Zero MS-DOS console flashing (pure Win32 GUI subsystem)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>5-Stage Wizard: System Check, EULA, Options, Carousel, Finish</span>
                  </li>
                </ul>
                <a
                  href="/download/onyx-windows-x64.exe"
                  download="onyx-windows-x64.exe"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d8ff38] text-[#07080a] font-bold text-xs hover:bg-[#cbf52b] transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Windows Installer (124 MB)</span>
                </a>
              </div>
              <div className="p-6 rounded-xl bg-[#07080a] border border-white/[0.08] font-mono text-xs">
                <div className="text-zinc-500 pb-3 border-b border-white/[0.06] mb-4">
                  INSTALLER ENVIRONMENT REGISTER
                </div>
                <div className="space-y-2 text-zinc-400">
                  <p className="text-zinc-500"># System Integration Verified</p>
                  <p><span className="text-[#38bdf8]">binary:</span> %LOCALAPPDATA%\Onyx\bin\onyx.exe</p>
                  <p><span className="text-[#38bdf8]">environment:</span> Registered in User PATH</p>
                  <p className="text-[#22c55e]">✓ Desktop shortcut: Onyx AI IDE.lnk created</p>
                  <p className="text-[#22c55e]">✓ Start Menu shortcut created</p>
                  <p className="text-[#22c55e]">✓ Windows App Registry: DisplayName "Onyx Autonomous AI IDE"</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. COMPETITIVE BATTLECARD */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-mono tracking-widest text-[#d8ff38] font-bold mb-3">
            TECHNICAL BATTLECARD
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            How Onyx Outperforms Commercial AI IDEs
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base">
            Compare Onyx head-to-head with Cursor, Windsurf, and Claude Code.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0c0e14]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#08090d] text-zinc-400 text-xs font-mono uppercase tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="p-4 sm:p-5">Capability / Strategic Moat</th>
                <th className="p-4 sm:p-5 text-center">Cursor</th>
                <th className="p-4 sm:p-5 text-center">Windsurf</th>
                <th className="p-4 sm:p-5 text-center">Claude Code</th>
                <th className="p-4 sm:p-5 text-center bg-[#131910] text-[#d8ff38]">Onyx Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300 font-sans">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Full Source Code &amp; IP Ownership</td>
                <td className="p-4 sm:p-5 text-center text-red-400">❌ Closed SaaS</td>
                <td className="p-4 sm:p-5 text-center text-red-400">❌ Closed SaaS</td>
                <td className="p-4 sm:p-5 text-center text-red-400">❌ Closed SaaS</td>
                <td className="p-4 sm:p-5 text-center bg-[#0e140b] text-[#22c55e] font-bold">✅ 100% Owned</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Token Cost Model</td>
                <td className="p-4 sm:p-5 text-center text-red-400">300%+ Markup</td>
                <td className="p-4 sm:p-5 text-center text-red-400">300%+ Markup</td>
                <td className="p-4 sm:p-5 text-center text-yellow-400">Anthropic Only</td>
                <td className="p-4 sm:p-5 text-center bg-[#0e140b] text-[#d8ff38] font-bold">✅ Wholesale BYOAI ($0)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">In-Process AST Verification</td>
                <td className="p-4 sm:p-5 text-center text-zinc-500">Post-facto</td>
                <td className="p-4 sm:p-5 text-center text-zinc-500">Post-facto</td>
                <td className="p-4 sm:p-5 text-center text-zinc-500">CLI Linter</td>
                <td className="p-4 sm:p-5 text-center bg-[#0e140b] text-[#22c55e] font-bold">✅ 37 Tree-Sitter WASMs</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Autonomous Cloud MicroVMs</td>
                <td className="p-4 sm:p-5 text-center text-red-400">❌ Local only</td>
                <td className="p-4 sm:p-5 text-center text-red-400">❌ Local only</td>
                <td className="p-4 sm:p-5 text-center text-red-400">❌ Local only</td>
                <td className="p-4 sm:p-5 text-center bg-[#0e140b] text-[#22c55e] font-bold">✅ Headless MicroVMs</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Frontier Multi-Model Agnostic</td>
                <td className="p-4 sm:p-5 text-center text-zinc-400">Limited</td>
                <td className="p-4 sm:p-5 text-center text-zinc-400">Limited</td>
                <td className="p-4 sm:p-5 text-center text-red-400">❌ Claude Only</td>
                <td className="p-4 sm:p-5 text-center bg-[#0e140b] text-[#22c55e] font-bold">✅ Claude, DeepSeek, GPT</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Air-Gapped Private VPC Deployment</td>
                <td className="p-4 sm:p-5 text-center text-red-400">❌ No</td>
                <td className="p-4 sm:p-5 text-center text-red-400">❌ No</td>
                <td className="p-4 sm:p-5 text-center text-red-400">❌ No</td>
                <td className="p-4 sm:p-5 text-center bg-[#0e140b] text-[#22c55e] font-bold">✅ 100% Air-Gapped</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. ENTERPRISE ROI CALCULATOR */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs uppercase font-mono tracking-widest text-[#d8ff38] font-bold mb-3">
            MEASURABLE FINANCIAL ROI
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            How Much Money Does Onyx Save Your Company?
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base">
            Calculate your annual savings by replacing marked-up seat subscriptions with Onyx's zero-marginal-cost BYOAI engine.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-2xl bg-[#0c0e14] border border-white/[0.1] max-w-4xl mx-auto shadow-2xl">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-white">Engineering Team Size:</span>
              <span className="text-xl font-bold text-[#d8ff38] font-mono">{devCount} Developers</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              value={devCount}
              onChange={(e) => setDevCount(Number(e.target.value))}
              className="w-full h-2 bg-[#1b2230] rounded-lg appearance-none cursor-pointer accent-[#d8ff38]"
            />
            <div className="flex justify-between text-[11px] text-zinc-500 mt-2 font-mono">
              <span>5 Devs</span>
              <span>50 Devs</span>
              <span>100 Devs</span>
              <span>150 Devs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/[0.08] text-center">
            <div className="p-4 rounded-xl bg-[#12151d]">
              <div className="text-xs font-mono text-zinc-400 mb-1">Traditional AI Subscriptions</div>
              <div className="text-2xl font-bold text-red-400 font-mono">${traditionalCost.toLocaleString()}</div>
              <div className="text-[11px] text-zinc-500 mt-1">per year with token markup</div>
            </div>

            <div className="p-4 rounded-xl bg-[#12151d]">
              <div className="text-xs font-mono text-zinc-400 mb-1">Onyx Enterprise BYOAI</div>
              <div className="text-2xl font-bold text-[#22c55e] font-mono">${onyxCost.toLocaleString()}</div>
              <div className="text-[11px] text-zinc-500 mt-1">pure wholesale token cost</div>
            </div>

            <div className="p-4 rounded-xl bg-[#152312] border border-[#22c55e]/30">
              <div className="text-xs font-mono text-[#d8ff38] font-bold mb-1">ANNUAL MONEY SAVED</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#d8ff38] font-mono">
                ${annualSavings.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#4ade80] mt-1 font-semibold">80.0% Expense Reduction</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 5-MINUTE CLIENT DEMO WALKTHROUGH SCRIPT */}
      <section id="demo-script" className="scroll-mt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-mono tracking-widest text-[#d8ff38] font-bold mb-3">
            EXECUTIVE DEMO WALKTHROUGH
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            The 5-Minute Pitch Script for Clients &amp; Buyers
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base">
            Use this step-by-step presentation flow when demonstrating Onyx to IT executives, SaaS founders, or M&amp;A buyers.
          </p>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded bg-[#d8ff38]/15 text-[#d8ff38] font-mono font-bold text-xs">
                MINUTE 01
              </span>
              <h4 className="text-base font-bold text-white">The Problem Hook (The Hidden $100k SaaS Tax)</h4>
            </div>
            <p className="text-zinc-300 text-sm italic bg-[#07080a] p-4 rounded-xl border border-white/[0.04] leading-relaxed">
              "Today, every software team is paying thousands each month for Cursor or Copilot. But here's the reality: they are charging a 300% markup on tokens, routing your proprietary IP through 3rd-party servers, and you own none of the platform. Onyx is the first complete autonomous AI engineering platform where you own the entire stack and pay pure wholesale token prices."
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded bg-[#22c55e]/15 text-[#22c55e] font-mono font-bold text-xs">
                MINUTE 02
              </span>
              <h4 className="text-base font-bold text-white">Live Cloud MicroVM Dispatch</h4>
            </div>
            <p className="text-zinc-300 text-sm italic bg-[#07080a] p-4 rounded-xl border border-white/[0.04] leading-relaxed">
              "Look at `app.oynx.si/cloud-agent`. I paste our Git repository URL and instruct the agent: 'Implement rate limiting and session expiration on auth routes, then write integration tests.' I hit Dispatch. Onyx provisions an isolated cloud microVM in US-East, clones the repo, and runs the entire engineering loop in the background. My machine stays completely free."
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded bg-[#38bdf8]/15 text-[#38bdf8] font-mono font-bold text-xs">
                MINUTE 03
              </span>
              <h4 className="text-base font-bold text-white">Zero Marginal Cost &amp; In-Process AST Verification</h4>
            </div>
            <p className="text-zinc-300 text-sm italic bg-[#07080a] p-4 rounded-xl border border-white/[0.04] leading-relaxed">
              "Now notice how Onyx ensures zero broken code. Inside our binary, we embedded 37 Tree-Sitter language WASMs. When the agent writes TypeScript, Onyx parses the AST before touching the file. If an import is missing, it's auto-corrected in-memory. And because you connect your own API keys, that task cost 80 cents instead of $15 on closed platforms."
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded bg-[#a855f7]/15 text-[#a855f7] font-mono font-bold text-xs">
                MINUTE 04
              </span>
              <h4 className="text-base font-bold text-white">Enterprise SSO &amp; White-Label Readiness</h4>
            </div>
            <p className="text-zinc-300 text-sm italic bg-[#07080a] p-4 rounded-xl border border-white/[0.04] leading-relaxed">
              "Here at `app.oynx.si/login`, your teams log in using Google Workspace, GitHub, Claude, or Corporate SAML SSO. If you want to white-label this platform under your corporate brand or deploy it inside your air-gapped AWS VPC, you have 100% source code ownership from day one."
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded bg-[#eab308]/15 text-[#eab308] font-mono font-bold text-xs">
                MINUTE 05
              </span>
              <h4 className="text-base font-bold text-white">The Closing Call to Action</h4>
            </div>
            <p className="text-zinc-300 text-sm italic bg-[#07080a] p-4 rounded-xl border border-white/[0.04] leading-relaxed">
              "Onyx is not a prototype. The installer is built, the cloud agent is live, the compiler engine is packaged, and the economics are proven. Whether you want to deploy this across your engineering organization to save $100k annually, or acquire the asset to launch your own AI IDE product line, Onyx is production-ready today."
            </p>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-12 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#10141d] to-[#07080a] border border-[#d8ff38]/30 shadow-[0_0_50px_rgba(216,255,56,0.1)]">
          <h3 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Ready to Experience the Onyx Platform?
          </h3>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Test the live cloud microVM agent, run the NVIDIA-style Windows installer, or explore enterprise deployment options.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://app.oynx.si/cloud-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#d8ff38] hover:bg-[#cbf52b] text-[#07080a] font-bold text-sm transition-all shadow-[0_0_25px_rgba(216,255,56,0.25)] hover:shadow-[0_0_35px_rgba(216,255,56,0.4)]"
            >
              <span>Launch Live Cloud Agent</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href="/download/onyx-windows-x64.exe"
              download="onyx-windows-x64.exe"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#161a24] hover:bg-[#1d2230] text-white border border-white/[0.12] font-semibold text-sm transition-all"
            >
              <Download className="w-4 h-4 text-[#d8ff38]" />
              <span>Download Windows Installer (.exe)</span>
            </a>

            <a
              href="https://github.com/Manash8666/oynx.git"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-transparent hover:bg-white/[0.06] text-zinc-300 border border-white/[0.08] font-medium text-sm transition-all"
            >
              <GithubIcon className="w-4 h-4" />
              <span>View GitHub Source</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
