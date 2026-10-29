import React, { useState } from 'react'
import { Cpu, ShieldCheck, GitFork, Scale, ArrowRight, Download, Check, Sparkles } from 'lucide-react'

export const ParallaxBanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)

  const showcases = [
    {
      id: 0,
      badge: '⚡ 153 TOKENS/SEC • $0 MARGINAL TOKEN COST',
      subtitle: 'DIMENSION 01 // AIR-GAPPED LOCAL AUTONOMY',
      title: 'Zero-Latency Local Synthesis',
      desc: 'Execute routine tab-completions, inline refactorings, and doc lookups locally on your GPU with Ollama and qwen2.5-coder:1.5b. 100% air-gapped privacy with zero data egress, auto-routing to DeepSeek-R1 cloud swarms only when deep reasoning is needed.',
      icon: Cpu,
      stats: [
        { label: 'Token Speed', value: '153 tok/s' },
        { label: 'Cloud Latency', value: '0 ms' },
        { label: 'Privacy', value: '100% Air-Gapped' },
      ],
      codeSnippet: `// Local GPU Synthesis via Ollama\nconst completion = await OllamaProvider.complete({\n  model: 'qwen2.5-coder:1.5b',\n  prompt: 'refactor: extract AST traversal to visitor pattern',\n  temperature: 0.1,\n})\n// 180 tokens synthesized in 1.17s (~153 tok/s) at $0 cost`,
    },
    {
      id: 1,
      badge: '🛡️ ZERO HALLUCINATED IMPORTS • IN-PROCESS LSP',
      subtitle: 'DIMENSION 02 // COMPILER VERIFICATION',
      title: 'In-Process Compiler Guard',
      desc: 'Tired of AI IDEs generating code that breaks your build? Onyx runs an in-process language server compilation loop that typechecks, compiles, and verifies every synthesized AST node before changes ever touch your physical disk.',
      icon: ShieldCheck,
      stats: [
        { label: 'Build Failures', value: '0%' },
        { label: 'AST Typechecks', value: '100%' },
        { label: 'Verification Latency', value: '14 ms' },
      ],
      codeSnippet: `// In-Process TypeScript Language Server Check\nconst diagnostics = await LspCompilerGuard.verifyAstNode(patch.ast)\nif (diagnostics.length > 0) {\n  // In-memory auto-correction loop\n  return await SelfHealingRuntime.autoCorrect(diagnostics, patch)\n}\n// Clean AST guaranteed before disk write`,
    },
    {
      id: 2,
      badge: '🧠 MULTI-HOP TOPOLOGICAL REASONING • PTY ROLLBACK',
      subtitle: 'DIMENSION 03 // SELF-HEALING REASONING',
      title: 'AST Graph-RAG & Knowledge Graph',
      desc: 'Onyx constructs a live knowledge graph across your entire codebase, calculating topological ripple impacts before modifying code. If tests fail, the self-healing runtime intercepts stack traces and self-corrects files, guarded by atomic git checkpoints for 1-click rollback.',
      icon: GitFork,
      stats: [
        { label: 'Graph Nodes', value: '6,369 files' },
        { label: 'Rollback Safety', value: '1-Click Atomic' },
        { label: 'Context Horizon', value: 'Monorepo-wide' },
      ],
      codeSnippet: `// Topological Ripple Analysis before Micro-Patch\nconst graph = await CodebaseKnowledgeGraph.build(projectRoot)\nconst dependents = graph.getDownstreamDependents('runtime.ts')\nawait Promise.all(dependents.map(d => LspCompilerGuard.verify(d)))\nconst checkpoint = await PtyGitCheckpoint.snapshot('Pre-patch safety')`,
    },
    {
      id: 3,
      badge: '⚖️ AGPL-3.0 COMMUNITY + COMMERCIAL ENTERPRISE EULA',
      subtitle: 'DIMENSION 04 // DUAL-LICENSE MOAT',
      title: 'The AI IDE You Actually Own',
      desc: 'Free for developers under GNU AGPL-3.0; closed-source enterprise exemptions governed by our commercial EULA. No cloud lock-in, zero vendor free-riding, and a legally fortified guarantee: You retain 100% exclusive copyright and ownership over all AI-generated code.',
      icon: Scale,
      stats: [
        { label: 'Customer IP', value: '100% Ownership' },
        { label: 'Model Training', value: 'Zero Telemetry' },
        { label: 'Dual-License', value: 'AGPL-3.0 + EULA' },
      ],
      codeSnippet: `// Legal Guard & License Certification\nconst compliance = await CleanRoomLegalEngine.audit({\n  license: 'AGPL-3.0',\n  commercialEula: true,\n  customerOwnership: '100% Exclusive',\n  thirdPartyScrapers: 'BARRED',\n})\n// 0 Violations, Dual-Licensing Ready Certified`,
    },
  ]

  const current = showcases[activeTab]
  const Icon = current.icon

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-anthracite-base border-y border-white/[0.08]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-[#d8ff38] font-sans text-xs font-medium uppercase tracking-widest mb-3">
            Core Architectural Dimensions
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-semibold leading-[1.15] tracking-tight text-white mb-4 text-balance">
            Engineered for Precision, Privacy &amp; Speed.
          </h2>
          <p className="font-sans text-sm sm:text-base font-normal leading-[1.6] text-zinc-400 text-balance">
            Explore the four foundational systems that separate Onyx from standard chat-based AI assistants.
          </p>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {showcases.map((s, idx) => {
            const TabIcon = s.icon
            const isActive = activeTab === idx
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2.5 rounded-xl font-mono-code text-xs flex items-center gap-2 transition-all ${
                  isActive
                    ? 'btn-volt font-bold shadow-volt-glow'
                    : 'bg-anthracite-charcoal text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#07080a]' : 'text-[#d8ff38]'}`} />
                <span>{s.title}</span>
              </button>
            )
          })}
        </div>

        {/* Interactive Feature Display Card */}
        <div className="bg-anthracite-charcoal rounded-3xl p-8 sm:p-12 border border-white/[0.08] shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Deep Dive Narrative */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-anthracite-surface border border-white/[0.08] text-[#d8ff38] font-mono-code text-xs mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#d8ff38]" />
                <span>{current.badge}</span>
              </div>
              <div className="text-xs font-mono-code text-zinc-500 mb-2 uppercase tracking-wider">
                {current.subtitle}
              </div>
              <h3 className="font-sans text-xl sm:text-2xl font-semibold leading-[1.25] tracking-snug text-white mb-4">
                {current.title}
              </h3>
              <p className="font-sans text-sm sm:text-base font-normal leading-[1.6] text-zinc-400 mb-8">
                {current.desc}
              </p>

              {/* Stat Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08]">
                {current.stats.map((st, sIdx) => (
                  <div key={sIdx}>
                    <div className="text-xs font-sans font-medium text-zinc-500 mb-1">{st.label}</div>
                    <div className="font-mono font-bold stat-number text-white text-base sm:text-lg text-[#d8ff38]">
                      {st.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Code & AST Execution Preview */}
            <div className="lg:col-span-5 bg-anthracite-base rounded-2xl p-5 border border-white/[0.08] shadow-inner font-mono-code text-xs text-left">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
                </div>
                <span className="text-[11px] text-zinc-400">onyx-runtime-engine</span>
              </div>
              <pre className="text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {current.codeSnippet}
              </pre>
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5 text-[#22c55e]">
                  <Check className="w-3.5 h-3.5" />
                  Verified Clean In-Process
                </span>
                <span className="text-zinc-500">Onyx v1.0</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
