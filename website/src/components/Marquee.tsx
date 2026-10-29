import React from 'react'

export const Marquee: React.FC = () => {
  const items = [
    'ZERO MARGINAL TOKEN COST',
    '100% CUSTOMER CODE OWNERSHIP',
    'GNU AGPL-3.0 COMMUNITY CORE',
    'COMMERCIAL EULA DUAL-LICENSE',
    'IN-PROCESS LSP COMPILER GUARD',
    'AST GRAPH-RAG TOPOLOGICAL INTEL',
    'ATOMIC PTY GIT SNAPSHOTS',
    'CLOUDFLARE VIBE SANDBOX',
    'LOCAL OLLAMA OFFLINE INFERENCE',
    'NO VENDOR CLOUD LOCK-IN',
  ]

  return (
    <div className="py-4 border-b border-white/5 bg-black/40 overflow-hidden select-none">
      <div className="flex w-max animate-marquee space-x-8 text-xs font-mono-code font-medium text-zinc-400 uppercase tracking-widest">
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-purple-400">✦</span>
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
