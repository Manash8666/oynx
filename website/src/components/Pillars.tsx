import React from 'react'
import { Cpu, ShieldCheck, GitFork, Undo2, ArrowUpRight, Scale, Terminal, Layers } from 'lucide-react'

interface PillarItem {
  number: string
  title: string
  subtitle: string
  description: string
  badge: string
  badgeClass: string
  icon: React.ReactNode
  specs: string[]
}

export const Pillars: React.FC = () => {
  const pillars: PillarItem[] = [
    {
      number: '01',
      title: 'In-Process Compiler Guard',
      subtitle: 'ZERO BROKEN SYNTAX',
      description: 'Never break your build again. Onyx validates synthesized AST nodes through an in-process language server compilation loop before changes ever touch your physical disk.',
      badge: 'Zero Hallucinated Imports',
      badgeClass: 'text-[#22c55e] bg-anthracite-surface border-[#22c55e]/30',
      icon: <ShieldCheck className="w-5 h-5 text-[#22c55e]" />,
      specs: ['In-process TypeScript & Rust language servers', 'Pre-flight AST syntax and type validation', 'Auto-rejects broken import specifiers'],
    },
    {
      number: '02',
      title: 'Zero-Latency Local GPU Inference',
      subtitle: 'AIR-GAPPED AUTONOMY',
      description: 'Run routine completions and inline refactors 100% air-gapped on your local GPU via Ollama. 153+ tok/s with zero cloud latency and zero marginal token cost.',
      badge: '153 tok/s • $0 Marginal Cost',
      badgeClass: 'text-[#d8ff38] bg-anthracite-surface border-volt/30',
      icon: <Cpu className="w-5 h-5 text-[#d8ff38]" />,
      specs: ['qwen2.5-coder:1.5b local default runner', 'Auto-routing to DeepSeek-R1 cloud swarm', '100% offline air-gapped zero data egress'],
    },
    {
      number: '03',
      title: 'AST Graph-RAG & Knowledge Graph',
      subtitle: 'TOPOLOGICAL REASONING',
      description: 'Onyx maps code symbols across your repository into a persistent knowledge graph, calculating multi-hop ripple impacts before patching and intercepting runtime stack traces.',
      badge: 'Multi-Hop Dependency Intel',
      badgeClass: 'text-zinc-200 bg-anthracite-surface border-white/[0.1]',
      icon: <GitFork className="w-5 h-5 text-white" />,
      specs: ['Cross-file symbol dependency tree', 'Topological blast-radius calculator', 'Persistent project memory that learns'],
    },
    {
      number: '04',
      title: 'PTY Terminal & Atomic Git Undo',
      subtitle: 'PROCESS SAFETY & REVERT',
      description: 'Bulletproof process guardianship with pseudo-terminal monitoring and automatic git checkpoints before risky operations. Roll back botched changes with 1 click.',
      badge: '1-Click Atomic Rollback',
      badgeClass: 'text-[#d8ff38] bg-anthracite-surface border-volt/30',
      icon: <Undo2 className="w-5 h-5 text-[#d8ff38]" />,
      specs: ['Claude Code-grade terminal session guardian', 'Automatic git tree snapshots before execution', 'Clean undo without dirtying commit history'],
    },
    {
      number: '05',
      title: 'Models at Cost • Zero Markup',
      subtitle: 'COMPLETE MODEL FREEDOM',
      description: 'Stop paying 300% markups on token requests. Route tasks between 500+ models: local open-weights, DeepSeek-R1, Claude 3.5 Sonnet, or your own private API keys.',
      badge: 'BYOK & Local GPU Free',
      badgeClass: 'text-[#22c55e] bg-anthracite-surface border-[#22c55e]/30',
      icon: <Layers className="w-5 h-5 text-[#22c55e]" />,
      specs: ['Zero cloud subscription seat tax', 'Bring Your Own Key (BYOK) support', 'Direct Ollama, OpenRouter, Anthropic & OpenAI'],
    },
    {
      number: '06',
      title: 'Dual-License Moat & IP Guarantee',
      subtitle: 'LEGAL CERTAINTY FOR ENTERPRISE',
      description: 'Open source for community developers under GNU AGPL-3.0; proprietary commercial EULA for enterprises. You retain 100% exclusive copyright on all generated code.',
      badge: '100% Customer IP Ownership',
      badgeClass: 'text-[#d8ff38] bg-anthracite-surface border-volt/30',
      icon: <Scale className="w-5 h-5 text-[#d8ff38]" />,
      specs: ['GNU Affero General Public License v3.0 core', 'Commercial EULA waives copyleft for enterprise', 'Legally guaranteed: Zero vendor IP claims'],
    },
  ]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-[#d8ff38] font-sans text-xs font-medium uppercase tracking-widest mb-3">
          Built Differently, On Purpose
        </div>
        <h2 className="font-sans text-3xl sm:text-4xl font-semibold leading-[1.15] tracking-tight text-white mb-4 text-balance">
          Architectural Superiority Over First-Gen AI IDEs.
        </h2>
        <p className="font-sans text-base sm:text-lg font-normal leading-[1.6] text-zinc-400 text-balance">
          Most AI coding assistants are simple chat wrappers. Onyx is an in-process autonomous compiler system designed from the ground up to prevent broken code, vendor lock-in, and code leaks.
        </p>
      </div>

      {/* 6-Card Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((p, idx) => (
          <div
            key={idx}
            className="anthracite-card anthracite-card-hover p-7 rounded-2xl flex flex-col justify-between group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-2xl font-bold stat-number text-zinc-700 group-hover:text-[#d8ff38] transition-colors">
                  {p.number}
                </span>
                <span className={`text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-full border ${p.badgeClass}`}>
                  {p.badge}
                </span>
              </div>
              <div className="text-[11px] font-sans font-medium text-zinc-500 mb-1 tracking-wider uppercase">
                {p.subtitle}
              </div>
              <h3 className="font-sans text-xl font-semibold leading-[1.25] tracking-snug text-white mb-2.5 flex items-center justify-between">
                <span>{p.title}</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#d8ff38]" />
              </h3>
              <p className="font-sans text-xs sm:text-sm font-normal leading-[1.6] text-zinc-400 mb-6">
                {p.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] space-y-2 text-xs font-mono-code text-zinc-400">
              {p.specs.map((spec, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <span className="text-[#22c55e]">✓</span>
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
