import React, { useState } from 'react'
import { Terminal, Shield, Zap, ArrowRight, Copy, Check, Sparkles, Download } from 'lucide-react'

interface HeroProps {
  onToggleParallax?: () => void
}

export const Hero: React.FC<HeroProps> = ({ onToggleParallax }) => {
  const [copied, setCopied] = useState(false)
  const installCmd = 'curl -fsSL https://onyx.dev/install.sh | sh'

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="pt-36 pb-20 px-4 relative overflow-hidden grid-lines">
      {/* Ambient Volt / Electric Lime Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] radial-glow-volt pointer-events-none -z-10"></div>

      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Kinetic Badge with Emerald Indicator & Volt Link */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-anthracite-charcoal border border-white/[0.08] text-zinc-300 font-mono-code text-xs mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
          <span>10 ARCHITECTURAL UPGRADES &amp; 5 COMPILER PILLARS</span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <button onClick={onToggleParallax} className="text-[#d8ff38] hover:underline hidden sm:inline-flex items-center gap-1">
            Experience Parallax Mode &rarr;
          </button>
        </div>

        {/* Main Kinetic Headline */}
        <h1 className="font-syne text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.05] mb-8">
          The Autonomous AI IDE <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-zinc-200 to-[#d8ff38] bg-clip-text text-transparent">
            You Actually Own.
          </span>
        </h1>

        {/* Sales Proposition Paragraph */}
        <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed mb-10 font-normal">
          Stop paying monthly seat taxes to cloud proxies that leak your proprietary code. Onyx combines{' '}
          <strong className="text-white font-semibold">153 tok/s local offline inference</strong> with an{' '}
          <strong className="text-white font-semibold">in-process LSP compiler guard</strong>, AST Graph-RAG, and a dual-license architecture built for both hackers and enterprises.
        </p>

        {/* Primary Call to Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14 w-full sm:w-auto">
          <a
            href="https://github.com/Manash8666/oynx.git"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl btn-volt text-sm font-bold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#07080a]" />
            <span>Download Onyx Free (AGPL-3.0)</span>
          </a>

          <button
            onClick={onToggleParallax}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-anthracite-surface hover:bg-anthracite-elevated text-white font-semibold text-sm border border-white/[0.08] hover:border-volt/40 transition-all flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-[#d8ff38] group-hover:rotate-12 transition-transform" />
            <span>Launch Kinetic Parallax Mode</span>
          </button>
        </div>

        {/* Live Terminal Quick Install Bar */}
        <div className="w-full max-w-xl bg-anthracite-charcoal rounded-2xl overflow-hidden border border-white/[0.08] shadow-anthracite-card p-4 flex items-center justify-between text-xs font-mono-code">
          <div className="flex items-center gap-2.5 text-zinc-300 overflow-x-auto py-1">
            <span className="text-[#d8ff38] font-bold">$</span>
            <span className="text-zinc-200">{installCmd}</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="ml-3 p-2 rounded-lg bg-anthracite-surface hover:bg-anthracite-elevated text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 shrink-0 border border-white/[0.06]"
            title="Copy command"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Interactive Live Compilation Teaser */}
        <div className="w-full max-w-4xl mt-10 bg-anthracite-charcoal rounded-2xl overflow-hidden border border-white/[0.08] shadow-anthracite-card">
          <div className="bg-anthracite-surface/90 px-4 py-3 border-b border-white/[0.08] flex items-center justify-between text-xs font-mono-code text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
              <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
              <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
              <span className="ml-2 text-zinc-300">onyx-compiler-daemon — live compilation loop</span>
            </div>
            <span className="text-[#d8ff38] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
              LSP Compiler Guard Active
            </span>
          </div>
          <div className="p-6 text-left font-mono-code text-xs space-y-2 text-zinc-300 bg-anthracite-base">
            <p><span className="text-[#d8ff38]">[ast:patch]</span> Synthesizing surgical micro-patch for <code className="text-zinc-200 bg-anthracite-surface px-1.5 py-0.5 rounded">packages/core/src/runtime.ts</code></p>
            <p><span className="text-[#22c55e]">[lsp:verify]</span> In-process TypeScript 5.8 compiler invoked: <span className="text-[#22c55e]">0 diagnostics (AST clean)</span></p>
            <p><span className="text-zinc-400">[graph:rag]</span> Calculating topological ripple: <span className="text-zinc-300">3 dependent modules verified</span></p>
            <p><span className="text-zinc-400">[pty:guard]</span> Checkpoint created: <span className="text-zinc-300">commit_7d9e4a (1-click atomic rollback ready)</span></p>
            <p className="text-zinc-400 pt-2 border-t border-white/[0.06]"><span className="text-[#22c55e] font-semibold">✓ Patch committed to disk</span> in 14ms with zero broken imports.</p>
          </div>
        </div>

      </div>
    </section>
  )
}
