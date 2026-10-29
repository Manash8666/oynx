import React from 'react'
import { Database, Binary, FileCode, GitCommit, ArrowRight } from 'lucide-react'

export const WorkflowLoop: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Monorepo AST Ingestion',
      subtitle: 'GRAPH-RAG INDEXING',
      description: 'Onyx maps code symbols across your repository into an AST knowledge graph, calculating multi-hop ripple impacts before touching disk.',
      icon: <Database className="w-5 h-5 text-purple-400" />,
    },
    {
      num: '02',
      title: 'In-Process Compiler Check',
      subtitle: 'LSP COMPILER GUARD',
      description: 'Target files are compiled in-memory via native language servers. Type errors and missing imports are caught and auto-corrected prior to write.',
      icon: <Binary className="w-5 h-5 text-indigo-400" />,
    },
    {
      num: '03',
      title: 'AST Surgical Micro-Patch',
      subtitle: 'SEMANTIC SLICING',
      description: 'Slices precise syntactic nodes and applies surgical diffs without wiping unrelated formatting, comments, or imports.',
      icon: <FileCode className="w-5 h-5 text-emerald-400" />,
    },
    {
      num: '04',
      title: 'Atomic PTY Checkpoint',
      subtitle: 'RECOVERY SAFETY NET',
      description: 'A shadow git commit is created instantly before any dangerous command runs in the PTY terminal. 1-click rollback if tests fail.',
      icon: <GitCommit className="w-5 h-5 text-amber-400" />,
    },
  ]

  return (
    <section id="process" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-purple-400 font-mono-code text-xs uppercase tracking-widest mb-3">
          The Execution Loop
        </div>
        <h2 className="font-syne text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          How Onyx Prevents Code Rot &amp; Build Breaks.
        </h2>
        <p className="text-zinc-400 text-base">
          Every file edit passes through a 4-stage compiler verification and safety checkpoint loop.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="onovo-glass onovo-glass-hover p-6 rounded-2xl relative flex flex-col justify-between border border-white/10"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-syne text-3xl font-extrabold text-zinc-600">
                  {s.num}
                </span>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  {s.icon}
                </div>
              </div>
              <div className="text-[11px] font-mono-code text-purple-400 mb-1 uppercase tracking-wider">
                {s.subtitle}
              </div>
              <h3 className="font-syne text-lg font-bold text-white mb-2">
                {s.title}
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-normal">
                {s.description}
              </p>
            </div>
            {idx < 3 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-5 h-5 text-zinc-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
