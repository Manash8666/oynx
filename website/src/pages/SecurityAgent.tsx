import React from 'react'
import { ShieldAlert, Lock, CheckCircle2, ArrowLeft, ArrowRight, Key, EyeOff, Server } from 'lucide-react'

export const SecurityAgent: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a] pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <div className="mb-6">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
        </div>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a1318] text-[#f43f5e] text-xs font-mono mb-4 border border-[#f43f5e]/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>DEVSECOPS AUTOMATION · ZERO-TRUST COMPLIANCE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Onyx Autonomous Security Agent
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Detect vulnerabilities, intercept hardcoded secrets, and patch security regressions before deployment. Built for enterprises that cannot compromise on zero-trust software supply chains.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href="https://app.oynx.si/cloud-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d8ff38] hover:bg-[#cbf52b] text-[#07080a] font-bold text-xs transition-all shadow-[0_0_20px_rgba(216,255,56,0.25)]"
            >
              <span>Dispatch Security Audit in Cloud Agent</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Key Security Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#261517] text-[#f43f5e] flex items-center justify-center mb-4">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Secret Leak Interception</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Entropy scanners detect AWS keys, GitHub tokens, database credentials, and RSA keys in code diffs before they reach version control.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#1b2212] text-[#d8ff38] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">In-Process SAST Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Static application security testing (SAST) parses AST nodes to uncover SQL injections, SSRF vectors, cross-site scripting (XSS), and insecure deserialization.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#122418] text-[#22c55e] flex items-center justify-center mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Air-Gapped Privacy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Audit code on-premises. Because Onyx supports local LLMs and private VPC runners, security evaluations never leak proprietary source code to external servers.
            </p>
          </div>
        </div>

        {/* Security Audit Telemetry Box */}
        <div className="p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08] font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4 text-zinc-500">
            <span>STATIC SECURITY AUDIT REPORT</span>
            <span className="text-[#22c55e]">PASS (0 CRITICAL)</span>
          </div>
          <div className="space-y-2 text-zinc-400">
            <p className="text-zinc-500"># Scanning repository tree: 124 files</p>
            <p><span className="text-[#38bdf8]">ast_sast:</span> Scanned 4,820 AST nodes across TypeScript and Go</p>
            <p className="text-[#22c55e]">✓ Secrets: 0 hardcoded credentials or API tokens found</p>
            <p className="text-[#22c55e]">✓ Dependencies: 0 high-severity CVE advisories</p>
            <p className="text-[#22c55e]">✓ OWASP Top 10: CSRF protection and sanitized inputs verified</p>
            <p className="text-white">● Status: Production deployment cleared</p>
          </div>
        </div>

      </div>
    </div>
  )
}
