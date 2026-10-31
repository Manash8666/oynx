import React from 'react'
import { FileText, Shield, CheckCircle2, Lock, ArrowLeft } from 'lucide-react'

export const Eula: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <div className="mb-6">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
        </div>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b2212] text-[#d8ff38] text-xs font-mono mb-4 border border-[#d8ff38]/30">
            <Shield className="w-3.5 h-3.5" />
            <span>COMMERCIAL ENTERPRISE LEGAL AGREEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
            Onyx Commercial End User License Agreement (EULA)
          </h1>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-500">
            <span>Effective Date: October 29, 2026</span>
            <span>•</span>
            <span>Licensor: Onyx Technologies Inc.</span>
            <span>•</span>
            <span>Framework: Dual-Licensed Enterprise Edition</span>
          </div>
        </div>

        {/* Highlight Callout: 100% IP Ownership */}
        <div className="mb-10 p-6 rounded-2xl bg-[#0e1610] border border-[#22c55e]/30 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#163820] text-[#22c55e] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-base font-bold text-white mb-1">
                Undivided Customer Code Ownership Guarantee (Section 2.1)
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                The Licensee retains 100% exclusive copyright, ownership, and title in and to all source code, software, and digital assets generated, completed, or refactored by Onyx. Onyx Technologies Inc. asserts zero claim of ownership, royalty, or downstream encumbrance.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Body Sections */}
        <div className="space-y-8 text-sm text-zinc-300 font-sans leading-relaxed">
          
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#d8ff38] font-mono">1.</span>
              <span>Grant of Commercial License</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              Licensor grants Licensee a worldwide, non-exclusive commercial license to install, execute, and operate the Onyx Software (including native desktop binaries, cloud microVM orchestrators, and extension bundles) for internal business operations.
            </p>
            <p className="text-xs text-zinc-400">
              <strong className="text-white">Copyleft Exemption:</strong> This commercial license explicitly waives and supersedes all copyleft requirements of Section 13 of the GNU Affero General Public License v3.0 (AGPL-3.0). Licensee is NOT required to disclose or open-source any proprietary internal code.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#d8ff38] font-mono">2.</span>
              <span>Intellectual Property &amp; Clean-Room Protections</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-2">
              Licensor retains all right, title, and interest in and to the underlying compiler engine, tree-sitter bindings, and brand assets.
            </p>
            <p className="text-xs text-zinc-400">
              Licensee's code is strictly segregated in ephemeral microVMs. Prompts and completions are processed in-memory and are never stored on persistent multitenant storage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#d8ff38] font-mono">3.</span>
              <span>Zero-Marginal-Cost BYOAI Governance</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Licensee connects directly to foundation model providers (Anthropic, DeepSeek, OpenAI) using their own API credentials. Onyx applies zero surcharge, synthetic token tax, or intermediate markups on inference traffic.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#d8ff38] font-mono">4.</span>
              <span>Enterprise SLA &amp; Support Warranty</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Commercial Enterprise subscriptions include guaranteed 99.98% runtime availability SLAs, dedicated security patches, and clean-room intellectual property indemnification.
            </p>
          </div>

        </div>

        {/* Footer Contact */}
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-500">
          <div>Onyx Technologies Inc. · Legal &amp; Licensing Department</div>
          <a href="mailto:licensing@onyx.dev" className="text-[#d8ff38] hover:underline">
            licensing@onyx.dev
          </a>
        </div>

      </div>
    </div>
  )
}
