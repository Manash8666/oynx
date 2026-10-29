import React, { useState } from 'react'
import { Terminal, Shield, Zap, Sparkles, ChevronRight, Menu, X, Layers } from 'lucide-react'
import { GithubIcon } from './icons'

interface NavbarProps {
  onToggleParallax?: () => void
  isParallaxMode?: boolean
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleParallax, isParallaxMode = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto onovo-glass rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl border border-white/10">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-400 flex items-center justify-center font-syne font-extrabold text-white text-lg shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
            O
          </div>
          <span className="font-syne font-extrabold text-xl tracking-tight text-white">
            Onyx<span className="text-purple-400">.code</span>
          </span>
          <span className="text-[10px] uppercase font-mono-code bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 hidden sm:inline-block">
            Dual-License Core
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-mono-code text-zinc-300">
          <a href="#features" className="hover:text-purple-400 transition-colors">Pillars</a>
          <a href="#process" className="hover:text-purple-400 transition-colors">Architecture</a>
          <a href="#comparison" className="hover:text-purple-400 transition-colors">Comparison</a>
          <a href="#studio" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Live Studio
          </a>
          <a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing &amp; EULA</a>
          <a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a>
        </nav>

        {/* Action Controls & Parallax Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleParallax}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono-code flex items-center gap-2 transition-all bg-purple-950/40 text-purple-200 border border-purple-500/30 hover:border-purple-400 hover:scale-105"
            title="Toggle Kinetic Parallax Showcase"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isParallaxMode ? 'Standard View' : 'Parallax Mode'}</span>
          </button>

          <a
            href="https://github.com/Manash8666/oynx.git"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-xs font-mono-code border border-white/10 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Star</span>
          </a>

          <a
            href="https://github.com/Manash8666/oynx.git"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 transition-transform hover:scale-105"
          >
            <span>Get Onyx Free</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-zinc-800/60 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto onovo-glass rounded-2xl p-5 border border-white/10 flex flex-col gap-4 text-sm font-mono-code text-zinc-300 shadow-2xl">
          <a onClick={() => setMobileMenuOpen(false)} href="#features" className="hover:text-purple-400">Pillars</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#process" className="hover:text-purple-400">Architecture</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#comparison" className="hover:text-purple-400">Comparison</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#studio" className="hover:text-purple-400">Live Studio</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#pricing" className="hover:text-purple-400">Pricing &amp; EULA</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#contact" className="hover:text-purple-400">Enterprise Contact</a>
          <div className="pt-2 border-t border-white/10 flex gap-3">
            <a
              href="https://github.com/Manash8666/oynx.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs"
            >
              Get Free AGPL Core
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
