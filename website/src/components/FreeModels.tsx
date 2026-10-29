import React, { useState } from 'react'
import { Sparkles, ArrowRight, ExternalLink, Cpu, Shield, Zap, Layers, Check } from 'lucide-react'

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
}

export const FreeModels: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'hosted' | 'local'>('all')

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
    },
    {
      id: 'laguna-s-2.1',
      name: 'Laguna S 2.1 (free)',
      provider: 'Poolside',
      description: 'Laguna S 2.1 is the latest coding agent model from Poolside. Laguna S 2.1 is a 118B total parameter architecture designed for multi-file editing.',
      rankLabel: 'Availability',
      rankValue: 'In Onyx',
      pricing: '$0.00/1M',
      context: '1M',
      type: 'hosted',
    },
    {
      id: 'nemotron-3-ultra',
      name: 'Nemotron 3 Ultra (free)',
      provider: 'NVIDIA',
      description: 'NVIDIA Nemotron 3 Ultra is an open frontier-reasoning and orchestration model from NVIDIA, with 55B active parameters.',
      rankLabel: 'Code agent rank',
      rankValue: '#16',
      pricing: '$0.00/1M',
      context: '128k',
      type: 'hosted',
    },
    {
      id: 'deepseek-r1-free',
      name: 'DeepSeek-R1 (free)',
      provider: 'DeepSeek',
      tag: 'Reasoning #1',
      description: 'DeepSeek-R1 open-weights with state-of-the-art math and code synthesis reasoning, accessible via free community providers or local GPU inference.',
      rankLabel: 'Reasoning rank',
      rankValue: '#1 Open Weight',
      pricing: '$0.00/1M',
      context: '64k',
      type: 'hybrid',
    },
    {
      id: 'qwen2.5-coder-32b',
      name: 'Qwen 2.5 Coder 32B (free local)',
      provider: 'Alibaba Cloud',
      tag: 'Offline Air-Gapped',
      description: 'Alibaba Cloud premier open coding model running natively at 153 tok/s on local GPUs via Ollama with zero cloud data egress.',
      rankLabel: 'Code agent rank',
      rankValue: '#3 Code Agent',
      pricing: '$0.00/1M',
      context: '128k',
      type: 'local',
    },
  ]

  const filtered = models.filter((m) => {
    if (activeFilter === 'hosted') return m.type === 'hosted' || m.type === 'hybrid'
    if (activeFilter === 'local') return m.type === 'local' || m.type === 'hybrid'
    return true
  })

  return (
    <section id="free-models" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Model Statistics Banner - Direct Match to Screenshot 3 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 p-6 rounded-2xl bg-anthracite-charcoal border border-white/[0.08] shadow-sm">
        <div className="text-left">
          <div className="text-xs uppercase font-mono-code text-zinc-500 mb-1">FREE MODELS</div>
          <div className="font-syne font-extrabold text-2xl sm:text-3xl text-[#d8ff38]">6</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">$0 input &amp; $0 output</div>
        </div>
        <div className="text-left">
          <div className="text-xs uppercase font-mono-code text-zinc-500 mb-1">LARGEST CONTEXT</div>
          <div className="font-syne font-extrabold text-2xl sm:text-3xl text-white">1M</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Poolside Laguna S 2.1</div>
        </div>
        <div className="text-left">
          <div className="text-xs uppercase font-mono-code text-zinc-500 mb-1">TOTAL CATALOG</div>
          <div className="font-syne font-extrabold text-2xl sm:text-3xl text-white">500+</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Local, open &amp; frontier</div>
        </div>
        <div className="text-left">
          <div className="text-xs uppercase font-mono-code text-zinc-500 mb-1">BYOAI SOVEREIGNTY</div>
          <div className="font-syne font-extrabold text-2xl sm:text-3xl text-[#22c55e]">100%</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Bring Your Own AI &amp; Keys</div>
        </div>
      </div>

      {/* Section Header - Matching Screenshot 1 */}
      <div className="text-left mb-6">
        <h2 className="font-syne text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Latest Free Models
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Active Onyx models with $0 input and $0 output pricing, sorted by freshness rather than quality.{' '}
          <a href="#studio" className="text-[#d8ff38] hover:underline font-semibold">
            Compare all model rankings &rarr;
          </a>
        </p>
      </div>

      {/* Explanatory Callout Box - Direct Replica of Screenshot 1 Callout */}
      <div className="mb-10 p-5 rounded-xl bg-anthracite-charcoal/70 border border-white/[0.08] text-xs text-zinc-400 leading-relaxed text-left">
        <p>
          <strong className="text-zinc-200">Free AI coding models in Onyx</strong> are active hosted models with zero input-token and zero output-token pricing. Free hosted inference is different from free-to-download weights: hosted promotions can end, and local models still require your own hardware and power. When a provider changes pricing or Onyx adds another free model, this list updates dynamically from the same model data used by the app.
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

      {/* 3-Column Responsive Model Cards Grid - Exact Structure of Screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="anthracite-card anthracite-card-hover rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between group"
          >
            <div>
              {/* Header with Title and Optional Tag */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-syne font-bold text-base text-white group-hover:text-[#d8ff38] transition-colors">
                  {m.name}
                </h3>
                {m.tag && (
                  <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-volt/10 text-[#d8ff38] border border-volt/30 shrink-0">
                    ✓ {m.tag}
                  </span>
                )}
              </div>

              {/* Provider & Description */}
              <p className="text-zinc-400 text-xs leading-relaxed mb-6 font-normal">
                {m.description}
              </p>
            </div>

            {/* Bottom Row with Rank and Pricing - Matching Screenshot 1 */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-mono-code mb-3">
                <span className="text-zinc-500">{m.rankLabel}</span>
                <span className="text-zinc-200 font-semibold">{m.rankValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#d8ff38] font-bold">
                  <span>{m.pricing}</span>
                  <span className="text-zinc-500 font-normal">({m.context} ctx)</span>
                </div>
                <a
                  href="#studio"
                  className="text-xs font-mono-code text-zinc-400 hover:text-white flex items-center gap-1 transition-colors group-hover:text-[#d8ff38]"
                >
                  <span>Launch in Onyx</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
