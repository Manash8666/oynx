import React, { useState } from 'react'
import { ChevronRight, Menu, X, Terminal, Shield, Zap } from 'lucide-react'
import { GithubIcon } from './icons'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto anthracite-glass rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl border border-white/[0.08]">
        
        {/* Brand Logo - Just Onyx */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-anthracite-surface border border-white/[0.1] flex items-center justify-center font-syne font-extrabold text-[#d8ff38] text-lg shadow-sm group-hover:border-volt transition-colors">
            O
          </div>
          <span className="font-syne font-extrabold text-xl tracking-tight text-white">
            Onyx
          </span>
          <span className="text-[10px] uppercase font-mono-code bg-anthracite-surface text-zinc-300 px-2.5 py-0.5 rounded-full border border-white/[0.08] hidden sm:inline-block">
            v1.0 • AGPL-3.0
          </span>
        </a>

        {/* Desktop Navigation Links Aligned cleanly like Kilo */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-mono-code text-zinc-300">
          <a href="#platforms" className="hover:text-[#d8ff38] transition-colors">Platforms</a>
          <a href="#features" className="hover:text-[#d8ff38] transition-colors">Pillars</a>
          <a href="#process" className="hover:text-[#d8ff38] transition-colors">Architecture</a>
          <a href="#comparison" className="hover:text-[#d8ff38] transition-colors">Comparison</a>
          <a href="#studio" className="hover:text-[#d8ff38] transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d8ff38]"></span>
            Live Studio
          </a>
          <a href="#pricing" className="hover:text-[#d8ff38] transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-[#d8ff38] transition-colors">FAQ</a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Manash8666/oynx.git"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-anthracite-surface hover:bg-anthracite-elevated text-zinc-300 hover:text-white text-xs font-mono-code border border-white/[0.08] transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Star on GitHub</span>
          </a>

          {/* Electric Lime / Volt Primary Button */}
          <a
            href="https://github.com/Manash8666/oynx.git"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-volt text-xs font-bold transition-all shadow-sm"
          >
            <span>Get Onyx Free</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#07080a]" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-anthracite-surface text-zinc-300 hover:text-white border border-white/[0.08]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto anthracite-glass rounded-2xl p-5 border border-white/[0.08] flex flex-col gap-4 text-sm font-mono-code text-zinc-300 shadow-2xl">
          <a onClick={() => setMobileMenuOpen(false)} href="#platforms" className="hover:text-[#d8ff38]">Platforms</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#features" className="hover:text-[#d8ff38]">Pillars</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#process" className="hover:text-[#d8ff38]">Architecture</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#comparison" className="hover:text-[#d8ff38]">Comparison</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#studio" className="hover:text-[#d8ff38]">Live Studio</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#pricing" className="hover:text-[#d8ff38]">Pricing</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#faq" className="hover:text-[#d8ff38]">FAQ</a>
          <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
            <a
              href="https://github.com/Manash8666/oynx.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center py-2.5 rounded-xl btn-volt font-bold text-xs"
            >
              Get Free AGPL Core
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
