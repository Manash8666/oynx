import React from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

interface ParallaxBannerProps {
  onLaunchParallax: () => void
}

export const ParallaxBanner: React.FC<ParallaxBannerProps> = ({ onLaunchParallax }) => {
  return (
    <section className="py-16 px-4 bg-anthracite-base border-y border-white/[0.08]">
      <div className="max-w-6xl mx-auto bg-anthracite-charcoal p-10 md:p-14 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/[0.08] shadow-anthracite-card">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d8ff38]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-anthracite-surface border border-white/[0.08] text-[#d8ff38] font-mono-code text-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#d8ff38]" />
            <span>KINETIC IMMERSIVE EXPERIENCE</span>
          </div>
          <h3 className="font-syne text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Experience Onyx in Kinetic Full-Screen Parallax.
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-normal">
            Step into the kinetic visual system featuring splitting typography, vertical slide mechanics, and architectural deep-dives on zero-latency local synthesis, LSP compiler verification, and enterprise code ownership.
          </p>
          <button
            onClick={onLaunchParallax}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl btn-volt text-sm font-bold"
          >
            <span>Launch Parallax Showcase</span>
            <ArrowRight className="w-4 h-4 text-[#07080a]" />
          </button>
        </div>

        {/* Thumbnail Preview Card */}
        <button
          onClick={onLaunchParallax}
          className="group relative block rounded-2xl overflow-hidden border border-white/[0.08] hover:border-volt/40 shadow-2xl hover:scale-105 transition-all max-w-sm text-left bg-anthracite-surface"
        >
          <img
            src="assets/images/hero-p-1.jpg"
            alt="Onyx Parallax Mode"
            className="w-full h-56 object-cover brightness-75 group-hover:brightness-95 transition-all"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
            <span className="text-xs font-mono-code text-[#d8ff38] uppercase tracking-wider mb-1">
              Full-Bleed Slide Engine
            </span>
            <span className="font-syne font-bold text-white text-base flex items-center justify-between">
              <span>4 Architectural Dimensions</span>
              <span className="text-[#d8ff38]">&rarr;</span>
            </span>
          </div>
        </button>
      </div>
    </section>
  )
}
