import React from 'react'
import { Shield, Lock, FileText, CheckCircle2, ArrowRight, Server, Globe } from 'lucide-react'

export const Compliance: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a] pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#162e24] text-[#22c55e] text-xs font-mono mb-4 border border-[#22c55e]/30">
            <Shield className="w-3.5 h-3.5" />
            <span>GLOBAL ENTERPRISE COMPLIANCE &amp; SECURITY SPECIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Platform Compliance &amp; Regulatory Standards
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Onyx is architected from the silicon up for zero-telemetry data sovereignty, open copyleft compliance under AGPL-3.0, and SOC2/ISO-27001 enterprise deployment readiness.
          </p>
        </div>

        {/* Quick Facts Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-5 rounded-xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="text-xs font-mono text-zinc-500 mb-1">OPEN-SOURCE CORE</div>
            <div className="text-lg font-bold text-white">AGPL-3.0 Standard</div>
            <div className="text-xs text-zinc-400 mt-1">Section 13 network copyleft protection</div>
          </div>
          <div className="p-5 rounded-xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="text-xs font-mono text-zinc-500 mb-1">COMMERCIAL DUAL-LICENSE</div>
            <div className="text-lg font-bold text-[#d8ff38]">Enterprise EULA</div>
            <div className="text-xs text-zinc-400 mt-1">100% Customer IP ownership waiver</div>
          </div>
          <div className="p-5 rounded-xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="text-xs font-mono text-zinc-500 mb-1">DATA RESIDENCY</div>
            <div className="text-lg font-bold text-[#22c55e]">Zero-Telemetry</div>
            <div className="text-xs text-zinc-400 mt-1">Local &amp; Private VPC Isolation</div>
          </div>
        </div>

        {/* Section 1: Customer Code Ownership */}
        <div className="mb-12 p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-[#22c55e]" />
            <h2 className="text-xl font-bold text-white">1. Customer Code Ownership &amp; Clean-Room IP Guarantee</h2>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">
            Onyx provides an absolute legal guarantee that all software, source code, schemas, and configurations synthesized, completed, or refactored by the Onyx compiler engine remain <strong className="text-white font-semibold">100% the undivided intellectual property of the customer</strong>.
          </p>
          <ul className="space-y-2.5 text-xs font-mono text-zinc-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
              <span>Zero copyright claim or royalty rights retained by Onyx Technologies Inc.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
              <span>Customer code is NEVER used to train, fine-tune, or benchmark public AI models.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
              <span>Clean-room legal indemnity against upstream license claims on generated code.</span>
            </li>
          </ul>
        </div>

        {/* Section 2: AGPL-3.0 & Enterprise Dual-Licensing */}
        <div className="mb-12 p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-[#d8ff38]" />
            <h2 className="text-xl font-bold text-white">2. Open-Source AGPL-3.0 &amp; Commercial Dual-Licensing</h2>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">
            Onyx utilizes the proven dual-licensing business model (pioneered by Grafana, Cal.com, Plausible, and Mastodon):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="p-5 rounded-xl bg-[#08090d] border border-white/[0.06]">
              <div className="text-xs font-mono text-[#22c55e] font-bold mb-2">COMMUNITY CORE (AGPL-3.0)</div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                Free for individual developers, open-source maintainers, and community teams operating under standard copyleft terms. Section 13 mandates that modified hosted network versions must provide source code access to interacting users.
              </p>
              <a href="/license" className="text-xs font-mono text-[#d8ff38] hover:underline flex items-center gap-1">
                <span>View AGPL-3.0 Terms</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="p-5 rounded-xl bg-[#08090d] border border-white/[0.06]">
              <div className="text-xs font-mono text-[#d8ff38] font-bold mb-2">ENTERPRISE EDITION (COMMERCIAL EULA)</div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                For organizations that require explicit exemption from AGPL-3.0 Section 13 copyleft, proprietary on-premises VPC hosting, custom SAML/SSO authentication, and commercial indemnification with 99.98% SLA guarantees.
              </p>
              <a href="/eula" className="text-xs font-mono text-[#d8ff38] hover:underline flex items-center gap-1">
                <span>View Commercial EULA</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 3: Foundation Model Acceptable Use Policy (AUP) Matrix */}
        <div className="mb-12 p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="text-xl font-bold text-white">3. Foundation Model &amp; AUP Regulatory Alignment</h2>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed mb-6">
            Onyx orchestrates open-weight and frontier foundation models with direct compliance tracking for enterprise commercial use:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#08090d] text-zinc-400 uppercase border-b border-white/[0.08]">
                <tr>
                  <th className="p-3">Model / Provider</th>
                  <th className="p-3">License Tier</th>
                  <th className="p-3">Commercial Rights</th>
                  <th className="p-3">Data Egress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                <tr>
                  <td className="p-3 font-bold text-white">Claude 3.7 Sonnet (Anthropic)</td>
                  <td className="p-3 text-zinc-400">Direct API BYOAI</td>
                  <td className="p-3 text-[#22c55e]">Full Commercial Code Gen</td>
                  <td className="p-3 text-zinc-400">Zero Retention / SOC2</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">DeepSeek R1 &amp; V3</td>
                  <td className="p-3 text-zinc-400">MIT / Permissive</td>
                  <td className="p-3 text-[#22c55e]">Commercial Permitted</td>
                  <td className="p-3 text-zinc-400">Direct or Local vLLM</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">GPT-4o (OpenAI)</td>
                  <td className="p-3 text-zinc-400">Direct API BYOAI</td>
                  <td className="p-3 text-[#22c55e]">Commercial Permitted</td>
                  <td className="p-3 text-zinc-400">Zero-Data-Retention API</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Ollama / Local Models</td>
                  <td className="p-3 text-zinc-400">MIT / Open Weight</td>
                  <td className="p-3 text-[#22c55e]">Unrestricted In-House</td>
                  <td className="p-3 text-[#22c55e]">100% Offline (Air-Gapped)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: SOC2 Type II & ISO 27001 Data Isolation */}
        <div className="p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-[#a855f7]" />
            <h2 className="text-xl font-bold text-white">4. SOC2 Type II, ISO/IEC 27001 &amp; GDPR Controls</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-zinc-400 mt-4">
            <div className="p-4 rounded-xl bg-[#08090d] border border-white/[0.04]">
              <div className="text-white font-bold mb-1">SOC2 Type II Ready</div>
              <p>Strict logical microVM isolation between tenant processes and virtual git worktrees.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#08090d] border border-white/[0.04]">
              <div className="text-white font-bold mb-1">ISO/IEC 27001</div>
              <p>Comprehensive cryptographic access controls, HMAC SHA-256 session verification, and key management.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#08090d] border border-white/[0.04]">
              <div className="text-white font-bold mb-1">GDPR &amp; EU AI Act</div>
              <p>EU-first provider controls, right to erasure, and zero telemetry tracking across developer environments.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
