import React, { useState, useEffect } from 'react'
import { ArrowLeft, ChevronUp, ChevronDown, Download, Sparkles, Shield, Cpu, GitBranch, Layers } from 'lucide-react'

interface ParallaxShowcaseProps {
  onClose: () => void
}

interface Slide {
  id: number
  badge: string
  subtitle: string
  title: string
  highlight: string
  desc: string
  image: string
  ctaText: string
  ctaLink: string
}

export const ParallaxShowcase: React.FC<ParallaxShowcaseProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides: Slide[] = [
    {
      id: 0,
      badge: '⚡ 153 TOKENS/SEC • $0 MARGINAL COST',
      subtitle: 'ARCHITECTURE 01 // LOCAL AUTONOMY',
      title: 'Zero-Latency',
      highlight: 'Local Synthesis',
      desc: 'Execute routine tab-completions, inline refactorings, and doc lookups locally on your GPU with Ollama and qwen2.5-coder:1.5b. 100% air-gapped privacy with zero data egress, auto-routing to DeepSeek-R1 cloud swarms only when deep reasoning is needed.',
      image: 'assets/images/hero-p-1.jpg',
      ctaText: 'Get Free Community Edition (AGPL-3.0)',
      ctaLink: 'https://github.com/Manash8666/oynx.git',
    },
    {
      id: 1,
      badge: '🛡️ ZERO HALLUCINATED IMPORTS • IN-PROCESS LSP',
      subtitle: 'PILLAR 02 // COMPILER VERIFICATION',
      title: 'In-Process',
      highlight: 'Compiler Guard',
      desc: 'Tired of AI IDEs generating code that breaks your build? Onyx runs an in-process language server compilation loop that rigorously typechecks, compiles, and verifies every synthesized AST node before changes ever touch your physical disk.',
      image: 'assets/images/hero-p-3.jpg',
      ctaText: 'Explore Compiler Guard Specs',
      ctaLink: '#features',
    },
    {
      id: 2,
      badge: '🧠 MULTI-HOP TOPOLOGICAL REASONING • PTY ROLLBACK',
      subtitle: 'PILLAR 03 // SELF-HEALING INTELLIGENCE',
      title: 'AST Graph-RAG',
      highlight: '& Runtime Sentry',
      desc: 'Onyx constructs a live knowledge graph across your entire codebase, calculating topological ripple impacts before modifying code. If tests fail, the self-healing runtime intercepts stack traces and self-corrects files, guarded by atomic git checkpoints for 1-click rollback.',
      image: 'assets/images/hero-27.jpg',
      ctaText: 'Test Graph-RAG in Studio',
      ctaLink: '#studio',
    },
    {
      id: 3,
      badge: '⚖️ AGPL-3.0 COMMUNITY + COMMERCIAL ENTERPRISE EULA',
      subtitle: 'STRATEGY 04 // DUAL-LICENSE MOAT',
      title: 'The AI IDE',
      highlight: 'You Actually Own',
      desc: 'Free for developers under GNU AGPL-3.0; closed-source enterprise exemptions governed by our commercial EULA. No cloud lock-in, zero vendor free-riding, and a legally fortified guarantee: You retain 100% exclusive copyright and ownership over all AI-generated code.',
      image: 'assets/images/hero-p-2-1.jpg',
      ctaText: 'Explore Enterprise Pricing & EULA',
      ctaLink: '#pricing',
    },
  ]

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides.length, onClose])

  const cur = slides[currentSlide]

  return (
    <div className="fixed inset-0 z-50 bg-[#07080a] text-white flex flex-col justify-between overflow-hidden select-none">
      
      {/* Background Parallax Image with Dark Anthracite Wash */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out transform scale-105"
        style={{ backgroundImage: `url(${cur.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080a]/95 via-[#0b0d11]/85 to-[#07080a]/70 backdrop-blur-[2px]"></div>
      </div>

      {/* Floating Top Nav */}
      <header className="relative z-20 px-6 py-5 flex items-center justify-between border-b border-white/[0.08] backdrop-blur-md bg-anthracite-charcoal/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-anthracite-surface border border-white/[0.1] flex items-center justify-center font-syne font-bold text-[#d8ff38] text-base shadow-sm">
            O
          </div>
          <span className="font-syne font-extrabold text-lg text-white">
            Onyx<span className="text-[#d8ff38]">.parallax</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono-code text-zinc-400 hidden sm:inline">
            Slide {currentSlide + 1} of {slides.length} (Use &uarr; &darr; keys)
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-anthracite-surface hover:bg-anthracite-elevated text-white text-xs font-mono-code transition-colors border border-white/[0.08]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#d8ff38]" />
            <span>Return to Agency View</span>
          </button>
        </div>
      </header>

      {/* Main Slide Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-start justify-center flex-1">
        
        {/* Pill Badge with Electric Lime */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-anthracite-charcoal border border-white/[0.08] text-[#d8ff38] font-mono-code text-xs mb-6 shadow-sm">
          {cur.badge}
        </div>

        {/* Subtitle */}
        <div className="text-xs font-mono-code text-zinc-400 uppercase tracking-widest mb-3">
          {cur.subtitle}
        </div>

        {/* Big Headline */}
        <h2 className="font-syne text-4xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
          {cur.title} <br />
          <span className="text-[#d8ff38]">
            {cur.highlight}
          </span>
        </h2>

        {/* Narrative Description */}
        <p className="max-w-2xl text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed mb-8 font-normal">
          {cur.desc}
        </p>

        {/* Slide Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={cur.ctaLink}
            onClick={() => {
              if (cur.ctaLink.startsWith('#')) onClose()
            }}
            className="px-8 py-4 rounded-xl btn-volt text-sm font-bold flex items-center gap-2"
          >
            <span>{cur.ctaText}</span>
          </a>
          <button
            onClick={onClose}
            className="px-6 py-4 rounded-xl bg-anthracite-surface hover:bg-anthracite-elevated text-white font-semibold text-sm border border-white/[0.08] transition-all"
          >
            <span>Explore All Features</span>
          </button>
        </div>

      </div>

      {/* Slide Navigation Pagination Controls */}
      <footer className="relative z-20 px-6 py-5 flex items-center justify-between border-t border-white/[0.08] backdrop-blur-md bg-anthracite-charcoal/80">
        <div className="flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide
                  ? 'w-8 bg-[#d8ff38] shadow-sm'
                  : 'w-2 bg-white/20 hover:bg-white/50'
              }`}
              title={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="p-2.5 rounded-xl bg-anthracite-surface hover:bg-anthracite-elevated text-white border border-white/[0.08] transition-colors"
            title="Previous Slide"
          >
            <ChevronUp className="w-4 h-4 text-zinc-300" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="p-2.5 rounded-xl bg-anthracite-surface hover:bg-anthracite-elevated text-white border border-white/[0.08] transition-colors"
            title="Next Slide"
          >
            <ChevronDown className="w-4 h-4 text-zinc-300" />
          </button>
        </div>
      </footer>

    </div>
  )
}
