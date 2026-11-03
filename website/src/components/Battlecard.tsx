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
      name: 'Dual-Cortex AI Agent (DeepSeek + Qwen)',
      onyx: 'Agent Lucifer (R1 + Qwen 2.5)',
      cursor: false,
      windsurf: false,
      copilot: false,
      isHighlight: true,
    },
    {
      name: 'Dual-Form Factor (Cloud Agent Web Hub + Standalone Native IDE)',
      onyx: 'Live Browser Hub + 327MB Native Electron IDE',
      cursor: 'Desktop Fork Only',
      windsurf: 'Desktop Fork Only',
      copilot: 'VS Code / JetBrains Plugin Only',
      isHighlight: true,
    },
    {
      name: 'Dedicated Role Token Architecture (QA, Review, Fix, Live Testing)',
      onyx: '5 Specialized Roles (0.9x - 2.0x Dynamic Quotas)',
      cursor: 'Single Generic Prompt Window',
      windsurf: 'Generic Flow Credits',
      copilot: 'Static Flat Completions',
      isHighlight: true,
    },
    {
      name: 'TechStack & Complexity Engine (L1 Syntax -> L4 Micro-Arch)',
      onyx: 'AST Verification for TS, Python, Rust, Go, C++, SQL',
      cursor: 'Generic Autocomplete Prompts',
      windsurf: 'Generic Cascade Flows',
      copilot: 'Prompt Text Only',
      isHighlight: true,
    },
    {
      name: '4x Multimodal Generative Studios (Audio, Video, Image, PDF AST)',
      onyx: 'Sonic DAW + Video-to-Playwright + Docling PDF AST',
      cursor: false,
      windsurf: false,
      copilot: false,
      isHighlight: true,
    },
    {
      name: 'Copyright Watermarked Asset Export & Sharing',
      onyx: 'WAV, WEBM, PNG, PDF with SVG Cryptographic Seal',
      cursor: false,
      windsurf: false,
      copilot: false,
    },
    {
      name: 'Marginal Token Cost',
      onyx: '$0.00 (Local GPU & Free Models)',
      cursor: '$20/mo + Usage Overage',
      windsurf: '$15/mo + Credits',
      copilot: '$19-$39/seat/mo',
      isHighlight: true,
    },
    {
      name: 'BYOAI (Bring Your Own AI & Custom Gateways)',
      onyx: 'Any Key, Local GPU & Custom URL',
      cursor: 'Limited BYOK (Cloud-Proxied Agent)',
      windsurf: 'Proprietary Flow Credits Only',
      copilot: 'GitHub / Azure Models Only',
      isHighlight: true,
    },
    {
      name: 'Deterministic AST Code Guardian (NPE, SQLi, Race Sentry)',
      onyx: 'Built-in Tree-Sitter Sentry',
      cursor: false,
      windsurf: false,
      copilot: false,
      isHighlight: true,
    },
    {
      name: 'In-IDE Sonic Studio & DAW Audio Sequencer',
      onyx: '4-Track Stems + BPM Sequencer',
      cursor: false,
      windsurf: false,
      copilot: false,
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
      name: 'NVIDIA-Inspired HD Retina Installer (Authenticode Signed)',
      onyx: 'Per-Monitor V2 High-DPI',
      cursor: 'Standard MSI',
      windsurf: 'Basic Setup',
      copilot: 'Extension Only',
    },
    {
      name: 'Multi-Provider Enterprise SSO',
      onyx: 'Google, GitHub, Claude, SAML',
      cursor: 'Basic OAuth',
      windsurf: 'Basic OAuth',
      copilot: 'Microsoft SSO',
      isHighlight: true,
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
        <div className="text-[#d8ff38] font-sans text-xs font-medium uppercase tracking-widest mb-3">
          The Competitive Battlecard
        </div>
        <h2 className="font-sans text-3xl sm:text-4xl font-semibold leading-[1.15] tracking-tight text-white mb-4">
          Why Engineers Are Migrating to Onyx.
        </h2>
        <p className="font-sans text-sm sm:text-base font-normal leading-[1.6] text-zinc-400">
          Direct technical comparison against cloud-reliant legacy and first-generation AI IDEs.
        </p>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="md:hidden text-center text-[11px] font-mono text-zinc-500 mb-3 flex items-center justify-center gap-1.5">
        <span className="text-[#d8ff38]">←</span>
        <span>Swipe horizontally to inspect comparison</span>
        <span className="text-[#d8ff38]">→</span>
      </div>

      <div className="bg-anthracite-charcoal rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.08] shadow-anthracite-card overflow-x-auto w-full max-w-full">
        <table className="w-full text-left text-xs font-mono min-w-[640px] sm:min-w-[700px] border-collapse">
          <thead className="bg-anthracite-surface/90 border-b border-white/[0.08] text-zinc-400">
            <tr>
              <th className="py-4 sm:py-5 px-4 sm:px-6 font-sans text-xs font-semibold text-white sticky left-0 bg-[#0d0f14] z-20 shadow-[2px_0_8px_rgba(0,0,0,0.6)]">Capability</th>
              <th className="py-4 sm:py-5 px-4 sm:px-6 bg-anthracite-surface border-x border-volt/20 font-sans text-xs font-semibold text-[#d8ff38]">
                <div className="flex items-center gap-2">
                  <span>✦ Onyx</span>
                  <span className="text-[10px] bg-volt/20 text-[#d8ff38] px-2 py-0.5 rounded-full font-bold">Ours</span>
                </div>
              </th>
              <th className="py-4 sm:py-5 px-4 sm:px-6">Cursor</th>
              <th className="py-4 sm:py-5 px-4 sm:px-6">Windsurf</th>
              <th className="py-4 sm:py-5 px-4 sm:px-6">GitHub Copilot</th>
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
                <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-zinc-300 font-medium sticky left-0 bg-[#0b0d12] z-10 shadow-[2px_0_8px_rgba(0,0,0,0.6)]">
                  {r.name}
                </td>
                <td className="py-3.5 sm:py-4 px-4 sm:px-6 bg-anthracite-surface/40 border-x border-volt/20">
                  {renderCell(r.onyx, true)}
                </td>
                <td className="py-3.5 sm:py-4 px-4 sm:px-6">{renderCell(r.cursor)}</td>
                <td className="py-3.5 sm:py-4 px-4 sm:px-6">{renderCell(r.windsurf)}</td>
                <td className="py-3.5 sm:py-4 px-4 sm:px-6">{renderCell(r.copilot)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
