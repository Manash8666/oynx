import React from 'react'
import { CheckCircle2, Shield, ArrowLeft, ArrowRight, GitPullRequest, Code2, Sparkles, Terminal } from 'lucide-react'

export const CodeReviewer: React.FC = () => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b2212] text-[#d8ff38] text-xs font-mono mb-4 border border-[#d8ff38]/30">
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>AUTONOMOUS CODE INTELLIGENCE · PR AUDITING</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Onyx AI Code Reviewer
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Automate code review workflows with deep abstract syntax tree (AST) inspections, anti-pattern detection, and architectural validation before changes merge into production.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href="https://app.oynx.si/cloud-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d8ff38] hover:bg-[#cbf52b] text-[#07080a] font-bold text-xs transition-all shadow-[0_0_20px_rgba(216,255,56,0.25)]"
            >
              <span>Launch Reviewer in Cloud Agent</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 3 Pillars of Onyx Code Reviewer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#1b2212] text-[#d8ff38] flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">In-Process AST Analysis</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Reviews don't rely on shallow text heuristics. Onyx parses incoming git diffs through 37 language Tree-Sitter grammars to verify type safety and syntactic validity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#122418] text-[#22c55e] flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated PR Gates</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Integrate with GitHub Actions or GitLab CI. Onyx reviews pull requests in under 15 seconds, leaving actionable suggestions and inline diff patches.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#10202c] text-[#38bdf8] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Architectural Guardrails</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enforce enterprise architectural guidelines: catches N+1 SQL queries, unhandled promise rejections, memory leaks, and breaking API schema changes.
            </p>
          </div>
        </div>

        {/* Interactive Simulation Console */}
        <div className="p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08] font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4 text-zinc-500">
            <span>LIVE CODE REVIEW AUDIT DEMO</span>
            <span className="text-[#22c55e]">VERIFIED</span>
          </div>
          <div className="space-y-2 text-zinc-400">
            <p className="text-zinc-500"># Evaluating Pull Request #148: feat/session-cache</p>
            <p><span className="text-[#38bdf8]">diff:</span> +128 lines, -14 lines (TypeScript)</p>
            <p className="text-[#eab308]">! Advisory at src/auth/cache.ts:32: Redis TTL missing default expiration</p>
            <p className="text-[#22c55e]">✓ AST tree: No circular imports detected</p>
            <p className="text-[#22c55e]">✓ Test suite: 18 unit tests passed</p>
            <p className="text-white">● Recommendation: LGTM with automatic TTL patch applied</p>
          </div>
        </div>

      </div>
    </div>
  )
}
