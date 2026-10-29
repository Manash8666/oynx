import React from 'react'
import { Cpu, ShieldCheck, GitFork, Undo2, ArrowUpRight } from 'lucide-react'

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
      title: 'Zero-Latency Local Synthesis',
      subtitle: 'LOCAL OFFLINE RUNNER',
      description: 'Run routine completions and inline refactors air-gapped on your local GPU via Ollama. 150+ tok/s with zero cloud latency and zero marginal token cost.',
      badge: '153 tok/s • $0 Marginal Cost',
      badgeClass: 'text-[#d8ff38] bg-anthracite-surface border-volt/30',
      icon: <Cpu className="w-5 h-5 text-[#d8ff38]" />,
      specs: ['qwen2.5-coder:1.5b local default', 'Auto-routing to DeepSeek-R1 cloud swarm', '100% air-gapped zero telemetry'],
    },
    {
      number: '02',
      title: 'In-Process Compiler Guard',
      subtitle: 'LSP TYPECHECK & VERIFICATION',
      description: 'Never break your build again. Onyx validates synthesized AST nodes through an in-process language server compilation loop before changes ever touch your physical disk.',
      badge: 'Zero Hallucinated Imports',
      badgeClass: 'text-[#22c55e] bg-anthracite-surface border-[#22c55e]/30',
      icon: <ShieldCheck className="w-5 h-5 text-[#22c55e]" />,
      specs: ['Native TypeScript/Rust language servers', 'Pre-flight AST syntax validation', 'Auto-rejects hallucinated identifiers'],
    },
    {
      number: '03',
      title: 'AST Graph-RAG & Runtime Sentry',
      subtitle: 'TOPOLOGICAL REASONING',
      description: 'Onyx maps code symbols across your monorepo into an AST knowledge graph, calculating multi-hop ripple impacts before patching and intercepting runtime stack traces.',
      badge: 'Topological Multi-Hop Intel',
      badgeClass: 'text-zinc-200 bg-anthracite-surface border-white/[0.1]',
      icon: <GitFork className="w-5 h-5 text-white" />,
      specs: ['Cross-file symbol dependency graph', 'Stack trace intercept & auto-repair loop', 'Predictive blast-radius calculator'],
    },
    {
      number: '04',
      title: 'PTY Terminal & Atomic Git Snapshots',
      subtitle: 'PROCESS SAFETY & REVERT',
      description: 'Bulletproof process guardianship with pseudo-terminal monitoring and automatic git checkpoints before risky operations. Roll back botched executions with 1 click.',
      badge: '1-Click Atomic Rollback',
      badgeClass: 'text-[#d8ff38] bg-anthracite-surface border-volt/30',
      icon: <Undo2 className="w-5 h-5 text-[#d8ff38]" />,
      specs: ['Claude Code-level terminal session tracking', 'Git tree snapshots before execution', 'Clean undo without dirtying commit history'],
    },
  ]

  return (
    <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-[#d8ff38] font-mono-code text-xs uppercase tracking-widest mb-3">
          Battle-Tested Foundations
        </div>
        <h2 className="font-syne text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Architectural Superiority Over First-Gen AI IDEs.
        </h2>
        <p className="text-zinc-400 text-base">
          Built on battle-tested engineering foundations from VS Code, Claude Code, and modern compiler design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {pillars.map((p, idx) => (
          <div
            key={idx}
            className="anthracite-card anthracite-card-hover p-8 rounded-3xl flex flex-col justify-between group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-syne text-3xl font-extrabold text-zinc-700 group-hover:text-[#d8ff38] transition-colors">
                  {p.number}
                </span>
                <span className={`text-[11px] font-mono-code px-3 py-1 rounded-full border ${p.badgeClass}`}>
                  {p.badge}
                </span>
              </div>
              <div className="text-xs font-mono-code text-zinc-500 mb-1 tracking-wider uppercase">
                {p.subtitle}
              </div>
              <h3 className="font-syne text-2xl font-bold text-white mb-3 flex items-center gap-2">
                {p.title}
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#d8ff38]" />
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-normal">
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
