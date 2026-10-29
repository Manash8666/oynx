import React from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

interface ParallaxBannerProps {
  onLaunchParallax: () => void
}

export const ParallaxBanner: React.FC<ParallaxBannerProps> = ({ onLaunchParallax }) => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-onyx-900 via-onyx-950 to-onyx-900 border-y border-white/5">
      <div className="max-w-6xl mx-auto onovo-glass p-10 md:p-14 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-purple-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono-code text-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>KINETIC IMMERSIVE EXPERIENCE</span>
          </div>
          <h3 className="font-syne text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Experience Onyx in Kinetic Full-Screen Parallax.
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-normal">
            Step into Onovo's kinetic visual system featuring splitting typography, vertical slide mechanics, and architectural deep-dives on zero-latency local synthesis, LSP compiler verification, and enterprise code ownership.
          </p>
          <button
            onClick={onLaunchParallax}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/50 transition-all hover:scale-105"
          >
            <span>Launch Parallax Showcase</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Preview Card */}
        <button
          onClick={onLaunchParallax}
          className="group relative block rounded-2xl overflow-hidden border border-white/10 shadow-2xl hover:scale-105 transition-transform max-w-sm text-left"
        >
          <img
            src="assets/images/hero-p-1.jpg"
            alt="Onyx Parallax Mode"
            className="w-full h-56 object-cover brightness-75 group-hover:brightness-95 transition-all"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5">
            <span className="text-xs font-mono-code text-purple-400 uppercase tracking-wider mb-1">
              Full-Bleed Slide Engine
            </span>
            <span className="font-syne font-bold text-white text-base">
              4 Architectural Dimensions &rarr;
            </span>
          </div>
        </button>
      </div>
    </section>
  )
}
