import React from 'react'
import { Check, X, ShieldAlert, Zap } from 'lucide-react'

interface FeatureRow {
  name: string
  onyx: string | boolean
  cursor: string | boolean
  windsurf: string | boolean
  copilot: string | boolean
  isHighlight?: boolean
}

export const Battlecard: React.FC = () => {
  const rows: FeatureRow[] = [
    {
      name: 'Marginal Token Cost',
      onyx: '$0.00 (Local Offline GPU)',
      cursor: '$20/mo + Usage Overage',
      windsurf: '$15/mo + Credits',
      copilot: '$19-$39/seat/mo',
      isHighlight: true,
    },
    {
      name: 'Local Offline Inference (Air-Gapped)',
      onyx: true,
      cursor: false,
      windsurf: false,
      copilot: false,
      isHighlight: true,
    },
    {
      name: 'In-Process Compiler Guard (Typecheck before write)',
      onyx: true,
      cursor: false,
      windsurf: false,
      copilot: false,
      isHighlight: true,
    },
    {
      name: 'Topological AST Graph-RAG (Multi-Hop Intel)',
      onyx: true,
      cursor: 'Vector Embeddings Only',
      windsurf: 'Context Window Only',
      copilot: 'Basic Embeddings',
    },
    {
      name: 'PTY Process Sentry & 1-Click Atomic Git Revert',
      onyx: true,
      cursor: false,
      windsurf: false,
      copilot: false,
    },
    {
      name: '100% Customer IP & Code Ownership',
      onyx: 'Guaranteed by Dual-License',
      cursor: 'Cloud Terms Apply',
      windsurf: 'Cloud Terms Apply',
      copilot: 'Microsoft Terms',
      isHighlight: true,
    },
    {
      name: 'Open Source Community Core',
      onyx: 'GNU AGPL-3.0',
      cursor: false,
      windsurf: false,
      copilot: false,
    },
    {
      name: 'Full Monorepo Extension Customization',
      onyx: true,
      cursor: 'Closed VS Code Fork',
      windsurf: 'Closed Fork',
      copilot: 'Plugin Only',
    },
  ]

  const renderCell = (val: string | boolean, isOnyx = false) => {
    if (typeof val === 'boolean') {
      return val ? (
        <span className={`inline-flex items-center gap-1 font-bold ${isOnyx ? 'text-[#d8ff38]' : 'text-zinc-300'}`}>
          <Check className="w-4 h-4 text-[#22c55e]" /> Yes
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-zinc-600 font-medium">
          <X className="w-4 h-4 text-zinc-600" /> No
        </span>
      )
    }
    return (
      <span className={isOnyx ? 'text-[#d8ff38] font-bold' : 'text-zinc-400'}>
        {val}
      </span>
    )
  }

  return (
    <section id="comparison" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-[#d8ff38] font-mono-code text-xs uppercase tracking-widest mb-3">
          The Competitive Battlecard
        </div>
        <h2 className="font-syne text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Why Engineers Are Migrating to Onyx.
        </h2>
        <p className="text-zinc-400 text-base">
          Direct technical comparison against cloud-reliant legacy and first-generation AI IDEs.
        </p>
      </div>

      <div className="bg-anthracite-charcoal rounded-3xl overflow-hidden border border-white/[0.08] shadow-anthracite-card overflow-x-auto">
        <table className="w-full text-left text-xs font-mono-code min-w-[700px]">
          <thead className="bg-anthracite-surface/90 border-b border-white/[0.08] text-zinc-400">
            <tr>
              <th className="py-5 px-6 font-syne text-sm text-white">Capability</th>
              <th className="py-5 px-6 bg-anthracite-surface border-x border-volt/20 font-syne text-sm text-[#d8ff38]">
                <div className="flex items-center gap-2">
                  <span>✦ Onyx</span>
                  <span className="text-[10px] bg-volt/20 text-[#d8ff38] px-2 py-0.5 rounded-full font-bold">Ours</span>
                </div>
              </th>
              <th className="py-5 px-6">Cursor</th>
              <th className="py-5 px-6">Windsurf</th>
              <th className="py-5 px-6">GitHub Copilot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r, idx) => (
              <tr
                key={idx}
                className={`transition-colors hover:bg-anthracite-surface/40 ${
                  r.isHighlight ? 'bg-anthracite-surface/20' : ''
                }`}
              >
                <td className="py-4 px-6 text-zinc-300 font-medium">
                  {r.name}
                </td>
                <td className="py-4 px-6 bg-anthracite-surface/40 border-x border-volt/20">
                  {renderCell(r.onyx, true)}
                </td>
                <td className="py-4 px-6">{renderCell(r.cursor)}</td>
                <td className="py-4 px-6">{renderCell(r.windsurf)}</td>
                <td className="py-4 px-6">{renderCell(r.copilot)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
