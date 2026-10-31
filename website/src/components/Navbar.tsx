import React, { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  Menu,
  X,
  Shield,
  Zap,
  Box,
  Layers,
  Key,
  Award,
  TrendingUp,
  Database,
  Lock,
  Compass,
  Sliders,
  FlaskConical,
  BookOpen,
  Activity,
  FileText,
  HelpCircle,
  ExternalLink,
  Laptop,
  Sparkles,
  GitPullRequest,
  Network
} from 'lucide-react'
import { GithubIcon, OnyxLogo } from './icons'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<'product' | 'models' | 'enterprise' | 'resources' | null>(null)
  const [starCount, setStarCount] = useState<number | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // Fetch genuine GitHub star count dynamically
  useEffect(() => {
    fetch('https://api.github.com/repos/Manash8666/oynx')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === 'number') {
          setStarCount(data.stargazers_count)
        }
      })
      .catch(() => {})
  }, [])

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

  // Robust Client-Side Routing and Anchor Handler
  const navigateTo = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setActiveDropdown(null)
    setMobileMenuOpen(false)

    // Handle cross-page anchor routing (e.g. from /docs to /#faq)
    if (path.startsWith('/#') || (path.startsWith('#') && window.location.pathname !== '/')) {
      const hash = path.includes('#') ? path.substring(path.indexOf('#')) : ''
      window.history.pushState({}, '', '/' + hash)
      window.dispatchEvent(new PopStateEvent('popstate'))
      return
    }

    // Handle same-page anchor smooth scroll
    if (path.startsWith('#')) {
      const id = path.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
      return
    }

    // Handle full route transition
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 py-3 transition-all duration-300" ref={navRef}>
      <div className="max-w-7xl mx-auto bg-[#07080a]/90 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl border border-white/[0.08] relative">
        
        {/* Brand Logo & Star Counter */}
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="/"
            onClick={(e) => navigateTo('/', e)}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <OnyxLogo size={32} className="shadow-md transition-transform group-hover:scale-105" />
            <span className="font-sans font-bold text-lg sm:text-xl tracking-tight text-white">
              Onyx
            </span>
          </a>

          {/* GitHub Star Badge (Clean URL, no .git) */}
          <a
            href="https://github.com/Manash8666/oynx"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12151d] hover:bg-[#181c26] text-xs font-mono text-zinc-300 border border-white/[0.08] hover:border-white/[0.2] transition-colors group"
            title="Star Onyx on GitHub"
          >
            <GithubIcon className="w-3.5 h-3.5 group-hover:text-white transition-colors" />
            <span className="font-semibold text-zinc-200">
              {starCount !== null && starCount > 0
                ? starCount >= 1000
                  ? `${(starCount / 1000).toFixed(1)}k`
                  : starCount.toString()
                : 'Star'}
            </span>
          </a>

          {/* Retina 4K/5K Ready Compliance Badge (Internal Page) */}
          <a
            href="/retina-ready"
            onClick={(e) => navigateTo('/retina-ready', e)}
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e1713] text-[#4ade80] border border-[#22c55e]/30 text-[11px] font-mono hover:bg-[#13221b] hover:border-[#22c55e]/60 transition-colors shadow-sm cursor-pointer"
            title="ISO/IEC 25010 and Apple Retina Subpixel Calibrated"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="font-semibold tracking-wide">RETINA 4K/5K READY</span>
          </a>

          {/* Desktop Navigation Links with Segregated Mega-Menus */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-sans font-medium text-zinc-300">
            
            {/* 1. Product Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'product' ? null : 'product')}
                onMouseEnter={() => setActiveDropdown('product')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeDropdown === 'product'
                    ? 'text-white bg-[#12151d]'
                    : 'hover:text-white text-zinc-300'
                }`}
              >
                <span>Product</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'product' ? 'rotate-180 text-[#d8ff38]' : 'text-zinc-500'}`} />
              </button>

              {/* Product Mega-Menu Dropdown */}
              {activeDropdown === 'product' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-3 w-[580px] p-6 rounded-2xl bg-[#0b0d11] border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.95)] grid grid-cols-2 gap-8 text-left z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Left Column: CODING AGENTS */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Coding Agents
                    </div>
                    <div className="space-y-3.5">
                      <a href="/what-is-onyx" onClick={(e) => navigateTo('/what-is-onyx', e)} className="flex items-start gap-3 group cursor-pointer">
                        <div className="w-7 h-7 rounded-lg bg-[#181c26] border border-white/[0.1] flex items-center justify-center text-[#d8ff38] shrink-0 font-mono text-xs font-bold">
                          &lt;/&gt;
                        </div>
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Onyx Code
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Autonomous AI engineering suite
                          </div>
                        </div>
                      </a>

                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-3 border-t border-white/[0.04] text-[11px] font-sans text-zinc-400">
                        <a href="https://app.oynx.si/agents" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                          <span>Cloud IDE</span>
                          <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                        </a>
                        <a href="/code-reviewer" onClick={(e) => navigateTo('/code-reviewer', e)} className="hover:text-white transition-colors cursor-pointer">Code Reviewer</a>
                        <a href="/docs" onClick={(e) => navigateTo('/docs', e)} className="hover:text-white transition-colors cursor-pointer">VS Code Ext</a>
                        <a href="/security-agent" onClick={(e) => navigateTo('/security-agent', e)} className="hover:text-white transition-colors cursor-pointer">Security Agent</a>
                        <a href="/docs" onClick={(e) => navigateTo('/docs', e)} className="hover:text-white transition-colors cursor-pointer">JetBrains Plugin</a>
                        <a href="/docs" onClick={(e) => navigateTo('/docs', e)} className="hover:text-white transition-colors cursor-pointer">CLI Manual</a>
                        <a href="https://app.oynx.si/cloud-agent" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                          <span>Cloud MicroVMs</span>
                          <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                        </a>
                        <a href="/what-is-onyx" onClick={(e) => navigateTo('/what-is-onyx', e)} className="hover:text-[#d8ff38] transition-colors font-semibold cursor-pointer">All Features &rarr;</a>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: INFERENCE & ROUTING */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Inference &amp; Routing
                    </div>
                    <div className="space-y-3">
                      <a href="/#byoai" onClick={(e) => navigateTo('/#byoai', e)} className="flex items-start gap-3 group cursor-pointer">
                        <Key className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Zero-Marginal BYOAI
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Direct upstream API keys with $0 markup
                          </div>
                        </div>
                      </a>

                      <a href="/pricing" onClick={(e) => navigateTo('/pricing', e)} className="flex items-start gap-3 group cursor-pointer">
                        <Zap className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Onyx Pass &amp; Pricing
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Transparent dual-licensing &amp; tiers
                          </div>
                        </div>
                      </a>

                      <a href="/compliance" onClick={(e) => navigateTo('/compliance', e)} className="flex items-start gap-3 group cursor-pointer">
                        <Shield className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            EU AI Compliance
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            GDPR air-gap &amp; data sovereignty
                          </div>
                        </div>
                      </a>

                      <a href="/retina-ready" onClick={(e) => navigateTo('/retina-ready', e)} className="flex items-start gap-3 group cursor-pointer">
                        <Layers className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Retina Display Standards
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            4K/5K High-DPI certification
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Models Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'models' ? null : 'models')}
                onMouseEnter={() => setActiveDropdown('models')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeDropdown === 'models'
                    ? 'text-white bg-[#12151d]'
                    : 'hover:text-white text-zinc-300'
                }`}
              >
                <span>Models</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'models' ? 'rotate-180 text-[#d8ff38]' : 'text-zinc-500'}`} />
              </button>

              {/* Models Mega-Menu Dropdown */}
              {activeDropdown === 'models' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-3 w-[600px] p-6 rounded-2xl bg-[#0b0d11] border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.95)] grid grid-cols-2 gap-8 text-left z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Left Column: RANKINGS & ROUTING */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Rankings &amp; Benchmarks
                    </div>
                    <div className="space-y-3.5">
                      <a href="/leaderboard" onClick={(e) => navigateTo('/leaderboard', e)} className="flex items-start gap-3 group cursor-pointer">
                        <Award className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Leaderboard
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Real-time model performance rankings
                          </div>
                        </div>
                      </a>

                      <a href="/leaderboard" onClick={(e) => navigateTo('/leaderboard', e)} className="flex items-start gap-3 group cursor-pointer">
                        <Activity className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            OnyxBench Suite
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Empirical AST syntax accuracy test
                          </div>
                        </div>
                      </a>

                      <a href="/#free-models" onClick={(e) => navigateTo('/#free-models', e)} className="flex items-start gap-3 group cursor-pointer">
                        <Zap className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Free Coding Models
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            High-speed $0 inference endpoints
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Right Column: DISCOVER & COMPARE */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Model Orchestration
                    </div>
                    <div className="space-y-3">
                      <a href="/docs" onClick={(e) => navigateTo('/docs', e)} className="flex items-start gap-3 group cursor-pointer">
                        <Laptop className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Local Models (Ollama)
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            100% offline air-gapped inference
                          </div>
                        </div>
                      </a>

                      <a href="/#byoai" onClick={(e) => navigateTo('/#byoai', e)} className="flex items-start gap-3 group cursor-pointer">
                        <Sliders className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Frontier Models
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Claude 3.7, DeepSeek R1, GPT-4o
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Enterprise Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'enterprise' ? null : 'enterprise')}
                onMouseEnter={() => setActiveDropdown('enterprise')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeDropdown === 'enterprise'
                    ? 'text-white bg-[#12151d]'
                    : 'hover:text-white text-zinc-300'
                }`}
              >
                <span>Enterprise</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'enterprise' ? 'rotate-180 text-[#d8ff38]' : 'text-zinc-500'}`} />
              </button>

              {activeDropdown === 'enterprise' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-3 w-84 p-5 rounded-2xl bg-[#0b0d11] border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.95)] space-y-3 text-left z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <a href="/vpc" onClick={(e) => navigateTo('/vpc', e)} className="flex items-start gap-3 group cursor-pointer">
                    <Network className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        Self-Hosted Private VPC
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Air-gapped clusters with zero data egress
                      </div>
                    </div>
                  </a>

                  <a href="/compliance" onClick={(e) => navigateTo('/compliance', e)} className="flex items-start gap-3 group cursor-pointer">
                    <Shield className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        Clean-Room Legal Indemnity
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        100% Customer IP ownership guarantee
                      </div>
                    </div>
                  </a>

                  <a href="/eula" onClick={(e) => navigateTo('/eula', e)} className="flex items-start gap-3 group cursor-pointer">
                    <FileText className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        Commercial EULA &amp; SLA
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Exemption from copyleft Section 13
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* 4. Resources Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
                onMouseEnter={() => setActiveDropdown('resources')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeDropdown === 'resources'
                    ? 'text-white bg-[#12151d]'
                    : 'hover:text-white text-zinc-300'
                }`}
              >
                <span>Resources</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'resources' ? 'rotate-180 text-[#d8ff38]' : 'text-zinc-500'}`} />
              </button>

              {activeDropdown === 'resources' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-3 w-80 p-5 rounded-2xl bg-[#0b0d11] border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.95)] space-y-3 text-left z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <a href="/docs" onClick={(e) => navigateTo('/docs', e)} className="flex items-start gap-3 group cursor-pointer">
                    <BookOpen className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        Documentation &amp; CLI Guide
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Full manual, ACP/MCP setup, and flags
                      </div>
                    </div>
                  </a>

                  <a href="/retina-ready" onClick={(e) => navigateTo('/retina-ready', e)} className="flex items-start gap-3 group cursor-pointer">
                    <Laptop className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        Retina Compliance Spec
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        4K/5K High-DPI display calibration
                      </div>
                    </div>
                  </a>

                  <a href="/#faq" onClick={(e) => navigateTo('/#faq', e)} className="flex items-start gap-3 group cursor-pointer">
                    <HelpCircle className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        Frequently Asked Questions
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Dual-licensing, pricing &amp; telemetry
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Direct Link: What is Onyx (High Impact Pill) */}
            <a
              href="/what-is-onyx"
              onClick={(e) => navigateTo('/what-is-onyx', e)}
              className="px-3 py-1.5 rounded-lg text-[#d8ff38] bg-[#d8ff38]/10 hover:bg-[#d8ff38]/20 border border-[#d8ff38]/30 font-semibold transition-all flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d8ff38]" />
              <span>What is Onyx</span>
            </a>

            {/* Direct Link: Pricing */}
            <a
              href="/pricing"
              onClick={(e) => navigateTo('/pricing', e)}
              className="px-3 py-1.5 rounded-lg hover:text-white transition-colors text-zinc-300 cursor-pointer"
            >
              Pricing
            </a>
          </nav>
        </div>

        {/* Right Action Controls: Sign In + Get Started Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="https://app.oynx.si/login"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-block text-xs font-sans font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Sign in
          </a>

          {/* Electric Lime 'Download .exe' Button */}
          <a
            href="/download/onyx-windows-x64.exe"
            download="onyx-windows-x64.exe"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#d8ff38] hover:bg-[#cbf52b] text-[#07080a] text-xs font-bold transition-all shadow-[0_0_15px_rgba(216,255,56,0.25)] hover:shadow-[0_0_20px_rgba(216,255,56,0.4)]"
          >
            Download .exe
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#12151d] text-zinc-300 hover:text-white border border-white/[0.08]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto bg-[#0b0d11] rounded-2xl p-5 border border-white/[0.08] flex flex-col gap-3 text-sm font-sans text-zinc-300 shadow-2xl text-left">
          <div className="text-xs uppercase text-zinc-500 font-mono-code font-bold tracking-wider pt-1">Navigation</div>
          <a onClick={(e) => navigateTo('/what-is-onyx', e)} href="/what-is-onyx" className="hover:text-[#d8ff38] text-[#d8ff38] font-bold flex items-center gap-2 cursor-pointer">
            <span>✦ What is Onyx (Client Pitch &amp; Moat)</span>
          </a>
          <a onClick={(e) => navigateTo('/docs', e)} href="/docs" className="hover:text-[#d8ff38] cursor-pointer">Developer Documentation &amp; CLI</a>
          <a onClick={(e) => navigateTo('/code-reviewer', e)} href="/code-reviewer" className="hover:text-[#d8ff38] cursor-pointer">AI Code Reviewer</a>
          <a onClick={(e) => navigateTo('/security-agent', e)} href="/security-agent" className="hover:text-[#d8ff38] cursor-pointer">Autonomous Security Agent</a>
          <a onClick={(e) => navigateTo('/leaderboard', e)} href="/leaderboard" className="hover:text-[#d8ff38] cursor-pointer">OnyxBench AI Leaderboard</a>
          <a onClick={(e) => navigateTo('/vpc', e)} href="/vpc" className="hover:text-[#d8ff38] cursor-pointer">Self-Hosted Private VPC</a>
          <a onClick={(e) => navigateTo('/compliance', e)} href="/compliance" className="hover:text-[#d8ff38] cursor-pointer">Compliance &amp; Legal Indemnity</a>
          <a onClick={(e) => navigateTo('/retina-ready', e)} href="/retina-ready" className="hover:text-[#d8ff38] cursor-pointer">Retina Display Specification</a>
          <a onClick={(e) => navigateTo('/pricing', e)} href="/pricing" className="hover:text-[#d8ff38] cursor-pointer">Pricing &amp; Dual-Licensing</a>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            <a
              href="https://app.oynx.si/login"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center py-2.5 rounded-lg bg-[#12151d] text-white font-medium text-xs border border-white/[0.08]"
            >
              Sign In to Cloud
            </a>
            <a
              href="/download/onyx-windows-x64.exe"
              download="onyx-windows-x64.exe"
              className="text-center py-2.5 rounded-lg bg-[#d8ff38] text-[#07080a] font-bold text-xs"
            >
              Download Windows .exe
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
