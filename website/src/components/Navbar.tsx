import React, { useState, useRef, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Terminal,
  Shield,
  Zap,
  Box,
  Layers,
  Key,
  Cpu,
  Monitor,
  Flame,
  Award,
  TrendingUp,
  Database,
  Lock,
  Compass
} from 'lucide-react'
import { GithubIcon } from './icons'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<'product' | 'models' | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 py-3 transition-all duration-300" ref={navRef}>
      <div className="max-w-7xl mx-auto anthracite-glass rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl border border-white/[0.08] relative">
        
        {/* Brand Logo - Just Onyx */}
        <div className="flex items-center gap-6">
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

          {/* Desktop Navigation Links with Segregated Mega-Menus (Kilo Structure) */}
          <nav className="hidden lg:flex items-center gap-2 text-xs font-mono-code text-zinc-300">
            
            {/* Product Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'product' ? null : 'product')}
                onMouseEnter={() => setActiveDropdown('product')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeDropdown === 'product'
                    ? 'text-white bg-anthracite-surface'
                    : 'hover:text-[#d8ff38]'
                }`}
              >
                <span>Product</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'product' ? 'rotate-180 text-[#d8ff38]' : ''}`} />
              </button>

              {/* Product Mega-Menu Dropdown - Exact Match to Screenshot 2 */}
              {activeDropdown === 'product' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-3 w-[580px] p-6 rounded-2xl bg-[#0b0d11] border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.95)] grid grid-cols-2 gap-8 text-left z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Column 1: CODING AGENTS */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Coding Agents
                    </div>
                    <div className="space-y-3.5">
                      <a href="#platforms" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Terminal className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Onyx Code
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Open source coding agent
                          </div>
                        </div>
                      </a>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04] text-[11px] font-mono-code text-zinc-400">
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white">VS Code</a>
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white">Code Reviewer</a>
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white">JetBrains</a>
                        <a href="#features" onClick={() => setActiveDropdown(null)} className="hover:text-white">Security Sentry</a>
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white">CLI</a>
                        <a href="#features" onClick={() => setActiveDropdown(null)} className="hover:text-white">PTY Terminal</a>
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white">Desktop App</a>
                        <a href="#features" onClick={() => setActiveDropdown(null)} className="hover:text-[#d8ff38]">All Features &rarr;</a>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: INFERENCE & ROUTING */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Inference &amp; Routing
                    </div>
                    <div className="space-y-3">
                      <a href="#byoai" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Key className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors flex items-center gap-1.5">
                            <span>BYOAI Gateway</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-volt/20 text-[#d8ff38]">New</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Bring your own keys, local models &amp; URLs
                          </div>
                        </div>
                      </a>

                      <a href="#free-models" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Zap className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Free Model Gateway
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            $0/1M input &amp; output hosted models
                          </div>
                        </div>
                      </a>

                      <a href="#studio" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Compass className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Auto Model Router
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Automatic routing for every coding task
                          </div>
                        </div>
                      </a>

                      <a href="#features" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Shield className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Clean-Room Legal Shield
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            100% Customer IP &amp; AGPL-3.0 compliance
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Models Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'models' ? null : 'models')}
                onMouseEnter={() => setActiveDropdown('models')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeDropdown === 'models'
                    ? 'text-white bg-anthracite-surface'
                    : 'hover:text-[#d8ff38]'
                }`}
              >
                <span>Models</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'models' ? 'rotate-180 text-[#d8ff38]' : ''}`} />
              </button>

              {/* Models Mega-Menu Dropdown - Exact Match to Screenshot 3 */}
              {activeDropdown === 'models' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-3 w-[620px] p-6 rounded-2xl bg-[#0b0d11] border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.95)] grid grid-cols-2 gap-8 text-left z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Column 1: RANKINGS & ROUTING */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Rankings &amp; Routing
                    </div>
                    <div className="space-y-3.5">
                      <a href="#comparison" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Award className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Leaderboard
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Real-time coding benchmark rankings
                          </div>
                        </div>
                      </a>

                      <a href="#free-models" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <TrendingUp className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Token Race
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Weekly provider latency &amp; pricing data
                          </div>
                        </div>
                      </a>

                      <a href="#studio" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Database className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Open Model Registry
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Browse 500+ supported LLMs
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Column 2: DISCOVER & COMPARE */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Discover &amp; Compare
                    </div>
                    <div className="space-y-3">
                      {/* Highlighted Free Coding Models (Matching Screenshot 3) */}
                      <a
                        href="#free-models"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2 rounded-xl bg-volt/10 border border-volt/30 group"
                      >
                        <Zap className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-syne font-bold text-[#d8ff38] text-xs flex items-center gap-1.5">
                            <span>Free Coding Models</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-volt text-[#07080a] font-bold">6 Active</span>
                          </div>
                          <div className="text-[11px] text-zinc-300 font-normal">
                            Tested free picks ($0/1M) &amp; live catalog
                          </div>
                        </div>
                      </a>

                      <a href="#byoai" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Key className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            BYOAI Inference Options
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Compare plans, BYOK, and local models
                          </div>
                        </div>
                      </a>

                      <a href="#byoai" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Cpu className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Local Models (Ollama)
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Ollama, LM Studio &amp; vLLM setup
                          </div>
                        </div>
                      </a>

                      <a href="#free-models" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Layers className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-syne font-bold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Open-Weight Models
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            DeepSeek-R1, Qwen 2.5, Nemotron
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Standard Nav Links */}
            <a href="#free-models" className="px-3 py-1.5 rounded-lg hover:text-[#d8ff38] transition-colors text-[#d8ff38] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d8ff38] animate-pulse"></span>
              Free Models
            </a>
            <a href="#byoai" className="px-3 py-1.5 rounded-lg hover:text-[#d8ff38] transition-colors">BYOAI</a>
            <a href="#features" className="px-3 py-1.5 rounded-lg hover:text-[#d8ff38] transition-colors">Pillars</a>
            <a href="#comparison" className="px-3 py-1.5 rounded-lg hover:text-[#d8ff38] transition-colors">Comparison</a>
            <a href="#studio" className="px-3 py-1.5 rounded-lg hover:text-[#d8ff38] transition-colors">Live Studio</a>
            <a href="#pricing" className="px-3 py-1.5 rounded-lg hover:text-[#d8ff38] transition-colors">Pricing</a>
            <a href="#faq" className="px-3 py-1.5 rounded-lg hover:text-[#d8ff38] transition-colors">FAQ</a>
          </nav>
        </div>

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
        <div className="lg:hidden mt-2 max-w-7xl mx-auto anthracite-glass rounded-2xl p-5 border border-white/[0.08] flex flex-col gap-3 text-sm font-mono-code text-zinc-300 shadow-2xl text-left">
          <div className="text-xs uppercase text-zinc-500 font-bold tracking-wider pt-1">Navigation</div>
          <a onClick={() => setMobileMenuOpen(false)} href="#free-models" className="hover:text-[#d8ff38] text-[#d8ff38] font-bold">★ Latest Free Models</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#byoai" className="hover:text-[#d8ff38]">✦ BYOAI: Bring Your Own AI</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#platforms" className="hover:text-[#d8ff38]">Platforms (VS Code, CLI, Desktop)</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#features" className="hover:text-[#d8ff38]">Architectural Pillars</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#comparison" className="hover:text-[#d8ff38]">Comparison Battlecard</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#studio" className="hover:text-[#d8ff38]">Live Dev Studio</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#pricing" className="hover:text-[#d8ff38]">Pricing &amp; Dual-Licensing</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#faq" className="hover:text-[#d8ff38]">Frequently Asked Questions</a>
          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
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
