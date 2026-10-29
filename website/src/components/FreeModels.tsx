import React, { useState } from 'react'
import { Sparkles, ArrowRight, ExternalLink, Cpu, Shield, Zap, Layers, Check, Activity, Radio, Globe, X, Terminal, Copy } from 'lucide-react'

export interface FreeModel {
  id: string
  name: string
  provider: string
  tag?: string
  description: string
  rankLabel: string
  rankValue: string
  pricing: string
  context: string
  type: 'hosted' | 'local' | 'hybrid'
  iconType: 'nvidia' | 'dots' | 'poolside' | 'deepseek' | 'alibaba'
  parameters: string
  activeParams: string
  latency: string
  architecture: string
  license: string
  curlExample: string
  ollamaCommand?: string
}

export const FreeModels: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'hosted' | 'local'>('all')
  const [selectedModel, setSelectedModel] = useState<FreeModel | null>(null)
  const [copied, setCopied] = useState(false)

  const models: FreeModel[] = [
    {
      id: 'nemotron-3.5-super-vl',
      name: 'Nemotron 3.5 Super VL (free)',
      provider: 'NVIDIA',
      tag: 'Recommended',
      description: 'NVIDIA Nemotron 3.5 Super VL is an open multimodal mixture-of-experts model from NVIDIA, with 12B active parameters out of 120B total.',
      rankLabel: 'Code agent rank',
      rankValue: '#8',
      pricing: '$0.00/1M',
      context: '128k',
      type: 'hosted',
      iconType: 'nvidia',
      parameters: '120B MoE',
      activeParams: '12B active',
      latency: '42ms TTFT',
      architecture: 'Vision-Language MoE',
      license: 'NVIDIA Open Model License',
      curlExample: `curl -X POST https://api.onyx.dev/v1/chat/completions \\
  -H "Authorization: Bearer onyx_free_guest" \\
  -d '{"model": "nemotron-3.5-super-vl", "messages": [{"role": "user", "content": "Refactor this AST parser"}]}'`,
    },
    {
      id: 'dots3-note-preview',
      name: 'Dots3-Note Preview (free)',
      provider: 'Dots Studio',
      description: 'Dots3-Note Preview is an open-weight mixture-of-experts model from Dots Studio, with 16B active parameters out of 280B total.',
      rankLabel: 'Availability',
      rankValue: 'In Onyx',
      pricing: '$0.00/1M',
      context: '256k',
      type: 'hosted',
      iconType: 'dots',
      parameters: '280B MoE',
      activeParams: '16B active',
      latency: '58ms TTFT',
      architecture: 'Deep Note Expert Mixture',
      license: 'Apache-2.0',
      curlExample: `curl -X POST https://api.onyx.dev/v1/chat/completions \\
  -H "Authorization: Bearer onyx_free_guest" \\
  -d '{"model": "dots3-note-preview", "messages": [{"role": "user", "content": "Generate architecture spec"}]}'`,
    },
    {
      id: 'laguna-s-2.1',
      name: 'Laguna S 2.1 (free)',
      provider: 'Poolside',
      description: 'Laguna S 2.1 is the latest coding agent model from Poolside (https://poolside.ai/). Laguna S 2.1 is a 118B total parameter architecture designed for multi-file editing.',
      rankLabel: 'Availability',
      rankValue: 'In Onyx',
      pricing: '$0.00/1M',
      context: '1M',
      type: 'hosted',
      iconType: 'poolside',
      parameters: '118B Dense',
      activeParams: '118B active',
      latency: '74ms TTFT',
      architecture: 'Extreme Context Multi-File Dense',
      license: 'Poolside Research Weights',
      curlExample: `curl -X POST https://api.onyx.dev/v1/chat/completions \\
  -H "Authorization: Bearer onyx_free_guest" \\
  -d '{"model": "laguna-s-2.1", "messages": [{"role": "user", "content": "Review entire 1M context workspace"}]}'`,
    },
    {
      id: 'nemotron-3-ultra',
      name: 'Nemotron 3 Ultra (free)',
      provider: 'NVIDIA',
      description: 'NVIDIA Nemotron 3 Ultra is an open frontier-reasoning and orchestration model from NVIDIA, with 55B active parameters out of 55B total.',
      rankLabel: 'Code agent rank',
      rankValue: '#16',
      pricing: '$0.00/1M',
      context: '128k',
      type: 'hosted',
      iconType: 'nvidia',
      parameters: '55B Dense',
      activeParams: '55B active',
      latency: '36ms TTFT',
      architecture: 'Dense Frontier Reasoning',
      license: 'NVIDIA Open Model License',
      curlExample: `curl -X POST https://api.onyx.dev/v1/chat/completions \\
  -H "Authorization: Bearer onyx_free_guest" \\
  -d '{"model": "nemotron-3-ultra", "messages": [{"role": "user", "content": "Execute compiler sanity check"}]}'`,
    },
    {
      id: 'deepseek-r1-free',
      name: 'DeepSeek-R1 (free)',
      provider: 'DeepSeek',
      tag: 'Reasoning #1',
      description: 'DeepSeek-R1 open-weights with state-of-the-art math, formal verification, and code synthesis reasoning, accessible via free community clusters or local GPU.',
      rankLabel: 'Reasoning rank',
      rankValue: '#1 Open Weight',
      pricing: '$0.00/1M',
      context: '64k',
      type: 'hybrid',
      iconType: 'deepseek',
      parameters: '671B MoE',
      activeParams: '37B active',
      latency: '62ms TTFT',
      architecture: 'Multi-head Latent Attention (MLA) Reasoning',
      license: 'MIT License',
      curlExample: `curl -X POST https://api.onyx.dev/v1/chat/completions \\
  -H "Authorization: Bearer onyx_free_guest" \\
  -d '{"model": "deepseek-r1", "messages": [{"role": "user", "content": "Solve multi-threaded memory race condition"}]}'`,
      ollamaCommand: 'ollama run deepseek-r1:32b',
    },
    {
      id: 'qwen2.5-coder-32b',
      name: 'Qwen 2.5 Coder 32B (free local)',
      provider: 'Alibaba Cloud',
      tag: 'Offline Air-Gapped',
      description: 'Alibaba Cloud premier open coding model running natively at 153 tok/s on local GPUs via Ollama with 100% data privacy and zero cloud egress.',
      rankLabel: 'Code agent rank',
      rankValue: '#3 Code Agent',
      pricing: '$0.00/1M',
      context: '128k',
      type: 'local',
      iconType: 'alibaba',
      parameters: '32.5B Dense',
      activeParams: '32.5B active',
      latency: '6.5ms (Local GPU)',
      architecture: 'Dense Transformer Code-Specialized',
      license: 'Apache-2.0',
      curlExample: `curl -X POST http://localhost:11434/api/generate \\
  -d '{"model": "qwen2.5-coder:32b", "prompt": "Write a zero-allocation Rust ring buffer"}'`,
      ollamaCommand: 'ollama run qwen2.5-coder:32b',
    },
  ]

  const filtered = models.filter((m) => {
    if (activeFilter === 'hosted') return m.type === 'hosted' || m.type === 'hybrid'
    if (activeFilter === 'local') return m.type === 'local' || m.type === 'hybrid'
    return true
  })

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderModelIcon = (type: FreeModel['iconType']) => {
    switch (type) {
      case 'nvidia':
        return (
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        )
      case 'dots':
        return (
          <div className="w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-[10px] text-zinc-200 shrink-0">
            D
          </div>
        )
      case 'poolside':
        return (
          <div className="w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
          </div>
        )
      case 'deepseek':
        return (
          <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        )
      case 'alibaba':
      default:
        return (
          <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
          </div>
        )
    }
  }

  return (
    <section id="free-models" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Model Statistics Banner - Direct Match to User Screenshot 3 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 rounded-2xl bg-anthracite-charcoal border border-white/[0.08] shadow-sm">
        <div className="text-left">
          <div className="text-xs uppercase font-sans font-medium tracking-micro text-zinc-500 mb-1">FREE MODELS</div>
          <div className="font-mono font-bold text-2xl sm:text-3xl stat-number text-[#d8ff38]">6</div>
          <div className="text-[11px] font-sans text-zinc-400 mt-0.5">$0 input &amp; $0 output pricing</div>
        </div>
        <div className="text-left">
          <div className="text-xs uppercase font-sans font-medium tracking-micro text-zinc-500 mb-1">LARGEST CONTEXT</div>
          <div className="font-mono font-bold text-2xl sm:text-3xl stat-number text-white">1M</div>
          <div className="text-[11px] font-sans text-zinc-400 mt-0.5">Poolside Laguna S 2.1</div>
        </div>
        <div className="text-left">
          <div className="text-xs uppercase font-sans font-medium tracking-micro text-zinc-500 mb-1">CATALOG</div>
          <div className="font-mono font-bold text-2xl sm:text-3xl stat-number text-white">500+</div>
          <div className="text-[11px] font-sans text-zinc-400 mt-0.5">Local, open &amp; frontier models</div>
        </div>
        <div className="text-left">
          <div className="text-xs uppercase font-sans font-medium tracking-micro text-zinc-500 mb-1">BYOAI SOVEREIGNTY</div>
          <div className="font-mono font-bold text-2xl sm:text-3xl stat-number text-[#22c55e]">100%</div>
          <div className="text-[11px] font-sans text-zinc-400 mt-0.5">Bring Your Own AI, Keys &amp; Gateway</div>
        </div>
      </div>

      {/* ON THIS PAGE - Exact Sub-Navigation Bar from User Screenshot 2 & 3 */}
      <div className="mb-14 text-left">
        <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-3">
          ON THIS PAGE
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a
            href="#comparison"
            className="p-3.5 rounded-xl bg-anthracite-charcoal/80 border border-white/[0.08] hover:border-[#d8ff38]/40 hover:bg-anthracite-surface transition-all group"
          >
            <div className="font-sans font-semibold text-xs text-white group-hover:text-[#d8ff38] transition-colors">
              Best tested models
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Comparable OnyxBench winners
            </div>
          </a>
          <a
            href="#free-models"
            className="p-3.5 rounded-xl bg-anthracite-charcoal/80 border border-[#d8ff38]/30 bg-anthracite-surface/50 transition-all group"
          >
            <div className="font-sans font-semibold text-xs text-[#d8ff38] transition-colors">
              Latest free models
            </div>
            <div className="text-[11px] text-zinc-300 mt-0.5">
              Live zero-cost model cards
            </div>
          </a>
          <a
            href="#byoai"
            className="p-3.5 rounded-xl bg-anthracite-charcoal/80 border border-white/[0.08] hover:border-[#d8ff38]/40 hover:bg-anthracite-surface transition-all group"
          >
            <div className="font-sans font-semibold text-xs text-white group-hover:text-[#d8ff38] transition-colors">
              Model option comparison
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Free vs paid, local, and BYOK
            </div>
          </a>
          <a
            href="#platforms"
            className="p-3.5 rounded-xl bg-anthracite-charcoal/80 border border-white/[0.08] hover:border-[#d8ff38]/40 hover:bg-anthracite-surface transition-all group"
          >
            <div className="font-sans font-semibold text-xs text-white group-hover:text-[#d8ff38] transition-colors">
              Setup steps
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Install, choose, and switch
            </div>
          </a>
        </div>
      </div>

      {/* Section Header (Geist Section H2: font-semibold leading-[1.15] tracking-tight) */}
      <div className="text-left mb-4">
        <h2 className="font-sans text-3xl sm:text-4xl font-semibold leading-[1.15] tracking-tight text-white mb-2">
          Latest Free Models
        </h2>
        <p className="font-sans text-sm sm:text-base font-normal leading-[1.6] text-zinc-400">
          Active Onyx models with $0 input and $0 output pricing, sorted by freshness rather than quality.{' '}
          <a href="#comparison" className="text-[#d8ff38] hover:underline font-semibold transition-colors">
            Compare all model rankings
          </a>
        </p>
      </div>

      {/* Explanatory Callout Box - Direct Replica of User Screenshot 1 */}
      <div className="mb-8 p-5 rounded-xl bg-anthracite-charcoal/90 border border-white/[0.08] text-xs text-zinc-400 leading-relaxed text-left shadow-sm">
        <p>
          <strong className="text-zinc-200">Free AI coding models in Onyx</strong> are active hosted models with zero input-token and zero output-token pricing. Free hosted inference is different from free-to-download weights: hosted promotions can end, and local models still require your own hardware and power. When a provider changes pricing or Onyx adds another free model, this list updates from the same model data used by the app.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-code transition-all ${
            activeFilter === 'all'
              ? 'btn-volt font-bold shadow-sm'
              : 'bg-anthracite-charcoal text-zinc-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          All Free Models (6)
        </button>
        <button
          onClick={() => setActiveFilter('hosted')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-code transition-all ${
            activeFilter === 'hosted'
              ? 'btn-volt font-bold shadow-sm'
              : 'bg-anthracite-charcoal text-zinc-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          Hosted Zero-Cost (4)
        </button>
        <button
          onClick={() => setActiveFilter('local')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-code transition-all ${
            activeFilter === 'local'
              ? 'btn-volt font-bold shadow-sm'
              : 'bg-anthracite-charcoal text-zinc-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          Local GPU Air-Gapped (2)
        </button>
      </div>

      {/* 3-Column Responsive Model Cards Grid - Exact Structure of User Screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
        {filtered.map((m) => (
          <div
            key={m.id}
            onClick={() => setSelectedModel(m)}
            className="rounded-xl p-5 bg-[#0b0d11] hover:bg-[#12151d] border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div>
              {/* Header with Provider Icon, Model Name and Optional Tag */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderModelIcon(m.iconType)}
                  <h3 className="font-sans text-sm sm:text-base font-semibold tracking-snug text-white group-hover:text-[#d8ff38] transition-colors truncate">
                    {m.name}
                  </h3>
                </div>
                {m.tag && (
                  <span className="text-[11px] font-mono-code px-2 py-0.5 rounded-full bg-[#d8ff38]/10 text-[#d8ff38] border border-[#d8ff38]/40 shrink-0 font-medium">
                    ✓ {m.tag}
                  </span>
                )}
              </div>

              {/* Provider & Description */}
              <p className="text-zinc-400 text-xs leading-relaxed mb-6 font-normal line-clamp-3">
                {m.description}
              </p>
            </div>

            {/* Bottom Row with Rank and Pricing - Matching Screenshot 1 */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <span>{m.rankLabel}</span>
                  {m.rankLabel.includes('rank') && (
                    <Activity className="w-3.5 h-3.5 text-[#22c55e]" />
                  )}
                </span>
                <span className="text-zinc-200 font-semibold">{m.rankValue}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono-code">
                <div className="flex items-center gap-1 text-[#d8ff38] font-bold">
                  <span>{m.pricing}</span>
                  <span className="text-zinc-500 font-normal">&lt;</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedModel(m)
                  }}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors group-hover:text-[#d8ff38]"
                >
                  <span>View</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Model Inspection Drawer / Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0b0d11] border border-white/[0.15] rounded-2xl p-6 sm:p-8 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedModel(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-4">
              {renderModelIcon(selectedModel.iconType)}
              <div>
                <h3 className="font-sans text-xl font-bold text-white flex items-center gap-2">
                  <span>{selectedModel.name}</span>
                  {selectedModel.tag && (
                    <span className="text-xs font-mono-code px-2 py-0.5 rounded-full bg-[#d8ff38]/10 text-[#d8ff38] border border-[#d8ff38]/40">
                      ✓ {selectedModel.tag}
                    </span>
                  )}
                </h3>
                <div className="text-xs font-mono-code text-zinc-400">
                  Provider: {selectedModel.provider} • Architecture: {selectedModel.architecture}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
              {selectedModel.description}
            </p>

            {/* Technical Specification Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-anthracite-surface/70 border border-white/[0.08] mb-6 text-xs font-mono-code">
              <div>
                <div className="text-zinc-500 uppercase text-[10px]">Context Window</div>
                <div className="text-white font-bold text-sm mt-0.5">{selectedModel.context}</div>
              </div>
              <div>
                <div className="text-zinc-500 uppercase text-[10px]">Total Params</div>
                <div className="text-white font-bold text-sm mt-0.5">{selectedModel.parameters}</div>
              </div>
              <div>
                <div className="text-zinc-500 uppercase text-[10px]">Active Params</div>
                <div className="text-[#d8ff38] font-bold text-sm mt-0.5">{selectedModel.activeParams}</div>
              </div>
              <div>
                <div className="text-zinc-500 uppercase text-[10px]">Token Pricing</div>
                <div className="text-[#22c55e] font-bold text-sm mt-0.5">$0.00 / 1M</div>
              </div>
            </div>

            {/* Integration Snippet */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-mono-code text-zinc-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#d8ff38]" />
                  <span>Onyx Integration Code:</span>
                </span>
                <button
                  onClick={() => handleCopyCode(selectedModel.ollamaCommand || selectedModel.curlExample)}
                  className="hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-black/70 border border-white/[0.08] text-xs font-mono-code text-zinc-200 overflow-x-auto leading-relaxed">
                <code>{selectedModel.ollamaCommand ? `# Run locally on GPU:\n${selectedModel.ollamaCommand}\n\n# Or query via Onyx API:\n${selectedModel.curlExample}` : selectedModel.curlExample}</code>
              </pre>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
              <div className="text-xs text-zinc-500 font-mono-code">
                License: {selectedModel.license}
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedModel(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-anthracite-surface hover:bg-anthracite-elevated text-zinc-300 text-xs font-semibold border border-white/[0.08]"
                >
                  Close
                </button>
                <a
                  href="#studio"
                  onClick={() => setSelectedModel(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl btn-volt text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>Launch in Onyx Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  )
}
