import React from 'react'
import { Database, Binary, FileCode, GitCommit, ArrowRight } from 'lucide-react'

export const WorkflowLoop: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Monorepo AST Ingestion',
      subtitle: 'GRAPH-RAG INDEXING',
      description: 'Onyx maps code symbols across your repository into an AST knowledge graph, calculating multi-hop ripple impacts before touching disk.',
      icon: <Database className="w-5 h-5 text-[#d8ff38]" />,
    },
    {
      num: '02',
      title: 'In-Process Compiler Check',
      subtitle: 'LSP COMPILER GUARD',
      description: 'Target files are compiled in-memory via native language servers. Type errors and missing imports are caught and auto-corrected prior to write.',
      icon: <Binary className="w-5 h-5 text-white" />,
    },
    {
      num: '03',
      title: 'AST Surgical Micro-Patch',
      subtitle: 'SEMANTIC SLICING',
      description: 'Slices precise syntactic nodes and applies surgical diffs without wiping unrelated formatting, comments, or imports.',
      icon: <FileCode className="w-5 h-5 text-[#22c55e]" />,
    },
    {
      num: '04',
      title: 'Atomic PTY Checkpoint',
      subtitle: 'RECOVERY SAFETY NET',
      description: 'A shadow git commit is created instantly before any dangerous command runs in the PTY terminal. 1-click rollback if tests fail.',
      icon: <GitCommit className="w-5 h-5 text-[#d8ff38]" />,
    },
  ]

  return (
    <section id="process" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-[#d8ff38] font-sans text-xs font-medium uppercase tracking-widest mb-3">
          The Execution Loop
        </div>
        <h2 className="font-sans text-3xl sm:text-4xl font-semibold leading-[1.15] tracking-tight text-white mb-4">
          How Onyx Prevents Code Rot &amp; Build Breaks.
        </h2>
        <p className="font-sans text-sm sm:text-base font-normal leading-[1.6] text-zinc-400">
          Every file edit passes through a 4-stage compiler verification and safety checkpoint loop.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="anthracite-card anthracite-card-hover p-6 rounded-2xl relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-3xl font-bold stat-number text-zinc-700">
                  {s.num}
                </span>
                <div className="p-2.5 rounded-xl bg-anthracite-surface border border-white/[0.08]">
                  {s.icon}
                </div>
              </div>
              <div className="text-[11px] font-sans font-medium text-[#d8ff38] mb-1 uppercase tracking-wider">
                {s.subtitle}
              </div>
              <h3 className="font-sans text-lg font-semibold tracking-snug text-white mb-2">
                {s.title}
              </h3>
              <p className="font-sans text-xs sm:text-sm font-normal leading-[1.6] text-zinc-400">
                {s.description}
              </p>
            </div>
            {idx < 3 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-5 h-5 text-zinc-700" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
