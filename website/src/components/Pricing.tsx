import React, { useState } from 'react'
import { Check, Sparkles, Shield, ArrowRight } from 'lucide-react'

interface PricingProps {
  onContactClick: () => void
}

export const Pricing: React.FC<PricingProps> = ({ onContactClick }) => {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-purple-400 font-mono-code text-xs uppercase tracking-widest mb-3">
          Transparent Dual-Licensing
        </div>
        <h2 className="font-syne text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Predictable Pricing. Zero Token Surprises.
        </h2>
        <p className="text-zinc-400 text-base mb-8">
          Choose open-source community freedom under AGPL-3.0, or unlock enterprise closed-source deployment with our commercial EULA.
        </p>

        {/* Annual / Monthly Billing Switcher */}
        <div className="inline-flex items-center gap-3 p-1 rounded-full onovo-glass border border-white/10 text-xs font-mono-code">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-1.5 rounded-full transition-all ${
              !isAnnual ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
              isAnnual ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Tier 1: Community Core */}
        <div className="onovo-glass onovo-glass-hover p-8 rounded-3xl flex flex-col justify-between border border-white/10">
          <div>
            <div className="text-xs font-mono-code text-purple-400 mb-2 uppercase tracking-wider">Open Source</div>
            <h3 className="font-syne text-2xl font-bold text-white mb-2">Community Core</h3>
            <p className="text-zinc-400 text-xs mb-6">
              Full local IDE autonomy for individual developers and open-source contributors.
            </p>
            <div className="mb-6">
              <span className="font-syne text-4xl font-extrabold text-white">$0</span>
              <span className="text-zinc-500 text-xs font-mono-code"> / forever</span>
            </div>
            <ul className="space-y-3 text-xs font-mono-code text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited local Ollama inference</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>In-process LSP compiler guard</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AST Graph-RAG (up to 15K symbols)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PTY Terminal &amp; atomic git snapshots</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Customer Code Ownership</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <span>GNU AGPL-3.0 copyleft applies to IDE mods</span>
              </li>
            </ul>
          </div>
          <a
            href="https://github.com/Manash8666/oynx.git"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-mono-code text-xs font-semibold text-white transition-colors text-center block"
          >
            Clone Free on GitHub &rarr;
          </a>
        </div>

        {/* Tier 2: Pro Developer */}
        <div className="onovo-glass onovo-glass-hover p-8 rounded-3xl flex flex-col justify-between border-2 border-purple-500/50 shadow-2xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono-code text-[11px] font-bold shadow-lg">
            RECOMMENDED FOR POWER USERS
          </div>
          <div>
            <div className="text-xs font-mono-code text-purple-400 mb-2 uppercase tracking-wider">Independent Dev</div>
            <h3 className="font-syne text-2xl font-bold text-white mb-2">Pro Developer</h3>
            <p className="text-zinc-400 text-xs mb-6">
              Local autonomy combined with cloud frontier swarm reasoning (DeepSeek-R1, Qwen3).
            </p>
            <div className="mb-6">
              <span className="font-syne text-4xl font-extrabold text-white">
                {isAnnual ? '$15' : '$19'}
              </span>
              <span className="text-zinc-500 text-xs font-mono-code"> / month {isAnnual ? '(billed annually)' : ''}</span>
            </div>
            <ul className="space-y-3 text-xs font-mono-code text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Everything in Community Core</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Cloud Swarm auto-routing (DeepSeek-R1)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Unlimited monorepo symbol Graph-RAG</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Ghost Sentry autonomous background agent</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Voice Copilot Engine &amp; Screen Assistant</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>100% Customer Code Ownership</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onContactClick}
            className="mt-8 w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-mono-code text-xs font-semibold text-white shadow-lg shadow-purple-900/50 transition-colors text-center"
          >
            Start 14-Day Free Trial &rarr;
          </button>
        </div>

        {/* Tier 3: Enterprise Team */}
        <div className="onovo-glass onovo-glass-hover p-8 rounded-3xl flex flex-col justify-between border border-white/10">
          <div>
            <div className="text-xs font-mono-code text-purple-400 mb-2 uppercase tracking-wider">Commercial EULA</div>
            <h3 className="font-syne text-2xl font-bold text-white mb-2">Enterprise Team</h3>
            <p className="text-zinc-400 text-xs mb-6">
              Closed-source corporate license waiving AGPL-3.0 with zero data egress guarantees.
            </p>
            <div className="mb-6">
              <span className="font-syne text-4xl font-extrabold text-white">
                {isAnnual ? '$39' : '$49'}
              </span>
              <span className="text-zinc-500 text-xs font-mono-code"> / seat / month</span>
            </div>
            <ul className="space-y-3 text-xs font-mono-code text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Commercial EULA (AGPL copyleft waived)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero telemetry / air-gapped VPC deployment</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom private model registry integration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Centralized team audit &amp; security policies</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated SLA &amp; Founder Architecture Support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Exclusive Customer Code Ownership</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onContactClick}
            className="mt-8 w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-mono-code text-xs font-semibold text-white transition-colors text-center"
          >
            Request Enterprise EULA &rarr;
          </button>
        </div>

      </div>
    </section>
  )
}
