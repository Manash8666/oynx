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
  Compass,
  Sliders,
  FlaskConical,
  BookOpen,
  Star,
  Activity,
  FileText,
  HelpCircle,
  ExternalLink,
  Laptop,
  Sparkles
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

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 py-3 transition-all duration-300" ref={navRef}>
      <div className="max-w-7xl mx-auto bg-[#07080a]/90 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl border border-white/[0.08] relative">
        
        {/* Brand Logo & Star Counter */}
        <div className="flex items-center gap-4 sm:gap-6">
          <a href="#" className="flex items-center gap-2.5 group">
            <OnyxLogo size={32} className="shadow-md transition-transform group-hover:scale-105" />
            <span className="font-sans font-bold text-lg sm:text-xl tracking-tight text-white">
              Onyx
            </span>
          </a>

          {/* GitHub Star Badge (Live Star Count from GitHub API) */}
          <a
            href="https://github.com/Manash8666/oynx.git"
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

              {/* Product Mega-Menu Dropdown - Direct Match to User Screenshot 2 */}
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
                      <a href="#platforms" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <div className="w-7 h-7 rounded-lg bg-[#181c26] border border-white/[0.1] flex items-center justify-center text-[#d8ff38] shrink-0 font-mono text-xs font-bold">
                          &lt;/&gt;
                        </div>
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Onyx Code
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Open source coding agent
                          </div>
                        </div>
                      </a>

                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-3 border-t border-white/[0.04] text-[11px] font-sans text-zinc-400">
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white transition-colors">IDE</a>
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white transition-colors">Code Reviewer</a>
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white transition-colors">VS Code</a>
                        <a href="#features" onClick={() => setActiveDropdown(null)} className="hover:text-white transition-colors">Security Agent</a>
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white transition-colors">JetBrains</a>
                        <a href="#features" onClick={() => setActiveDropdown(null)} className="hover:text-white transition-colors">Slack Bot</a>
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white transition-colors">CLI</a>
                        <a href="#features" onClick={() => setActiveDropdown(null)} className="hover:text-[#d8ff38] transition-colors">All Features &rarr;</a>
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white transition-colors">Cloud</a>
                        <a href="#platforms" onClick={() => setActiveDropdown(null)} className="hover:text-white transition-colors">Mobile</a>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: INFERENCE & ROUTING */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Inference &amp; Routing
                    </div>
                    <div className="space-y-3">
                      <a href="#byoai" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Key className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Gateway
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Model routing and control
                          </div>
                        </div>
                      </a>

                      <a href="#pricing" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Zap className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Onyx Pass
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            AI inference credits with zero markup
                          </div>
                        </div>
                      </a>

                      <a href="#studio" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Compass className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Auto Model
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Automatic model routing for every task
                          </div>
                        </div>
                      </a>

                      <a href="#features" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Shield className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            EU AI Coding
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            EU-first provider controls &amp; GDPR air-gap
                          </div>
                        </div>
                      </a>

                      <a href="#byoai" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Layers className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Inference Options
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Compare plans, BYOK, and local models
                          </div>
                        </div>
                      </a>

                      <a href="#free-models" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Box className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Marketplace
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Partner deals, extensions, and offers
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

              {/* Models Mega-Menu Dropdown - Direct Match to User Screenshot 3 */}
              {activeDropdown === 'models' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-3 w-[620px] p-6 rounded-2xl bg-[#0b0d11] border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.95)] grid grid-cols-2 gap-8 text-left z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Left Column: RANKINGS & ROUTING */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Rankings &amp; Routing
                    </div>
                    <div className="space-y-3.5">
                      <a href="#comparison" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
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

                      <a href="#free-models" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <TrendingUp className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Token Race
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Weekly provider usage over time
                          </div>
                        </div>
                      </a>

                      <a href="#free-models" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Zap className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Inference
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Provider speed and pricing data
                          </div>
                        </div>
                      </a>

                      <a href="#comparison" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Activity className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            OnyxBench
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Onyx's AI coding benchmark suite
                          </div>
                        </div>
                      </a>

                      <a href="#studio" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Compass className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Auto Model
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Automatic model routing for every task
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Right Column: DISCOVER & COMPARE */}
                  <div>
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-white/[0.06]">
                      Discover &amp; Compare
                    </div>
                    <div className="space-y-3">
                      <a href="#byoai" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Layers className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Inference Options
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            See all the inference options in Onyx
                          </div>
                        </div>
                      </a>

                      <a href="#features" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Sliders className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Providers
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Training, retention, and policy links
                          </div>
                        </div>
                      </a>

                      <a href="#studio" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <FlaskConical className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Browse by Lab
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Explore models from every AI lab
                          </div>
                        </div>
                      </a>

                      <a href="#byoai" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Laptop className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Local Models
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Ollama and LM Studio setup
                          </div>
                        </div>
                      </a>

                      <a href="#free-models" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <BookOpen className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            Open-Weight Models
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Open-weight coding model rankings
                          </div>
                        </div>
                      </a>

                      {/* Highlighted Free Coding Models (Exact Match to Screenshot 3 Highlight) */}
                      <a
                        href="#free-models"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl bg-[#d8ff38]/10 border border-[#d8ff38]/40 group hover:bg-[#d8ff38]/15 transition-all"
                      >
                        <Zap className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-[#d8ff38] text-xs flex items-center gap-1.5">
                            <span>Free Coding Models</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#d8ff38] text-[#07080a] font-bold">4 Active</span>
                          </div>
                          <div className="text-[11px] text-zinc-300 font-normal">
                            Tested free picks and live catalog
                          </div>
                        </div>
                      </a>

                      <a href="#studio" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                        <Sparkles className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 group-hover:text-[#d8ff38]" />
                        <div>
                          <div className="font-sans font-semibold tracking-tight text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                            New Open Weights
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">
                            Verified release tracker
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
                  className="absolute top-full left-0 mt-3 w-80 p-5 rounded-2xl bg-[#0b0d11] border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.95)] space-y-3 text-left z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <a href="#contact" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                    <Shield className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        Self-Hosted VPC Deployment
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Air-gapped clusters with zero data egress
                      </div>
                    </div>
                  </a>

                  <a href="#contact" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                    <Lock className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        Clean-Room Legal Indemnity
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        100% Customer IP ownership guarantee
                      </div>
                    </div>
                  </a>

                  <a href="#contact" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                    <Database className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        Custom In-House Compilers
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Proprietary language LSP syntax guards
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
                  <a href="https://github.com/Manash8666/oynx.git" target="_blank" rel="noopener noreferrer" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                    <FileText className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        Documentation &amp; Guides
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Quickstart, VS Code setup &amp; API keys
                      </div>
                    </div>
                  </a>

                  <a href="#byoai" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                    <Laptop className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-sans font-semibold text-white text-xs group-hover:text-[#d8ff38] transition-colors">
                        BYOAI Architecture Guide
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Connecting Ollama, LM Studio &amp; LiteLLM
                      </div>
                    </div>
                  </a>

                  <a href="#faq" onClick={() => setActiveDropdown(null)} className="flex items-start gap-3 group">
                    <HelpCircle className="w-4 h-4 text-[#d8ff38] shrink-0 mt-0.5" />
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

            {/* Direct Links */}
            <a href="#pricing" className="px-3 py-1.5 rounded-lg hover:text-white transition-colors text-zinc-300">
              Pricing
            </a>
          </nav>
        </div>

        {/* Right Action Controls: Sign In + Get Started Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="https://app.oynx.si"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-block text-xs font-sans font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Sign in
          </a>

          {/* Bright Yellow / Electric Lime 'Get Started' Button */}
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
          <a onClick={() => setMobileMenuOpen(false)} href="#free-models" className="hover:text-[#d8ff38] text-[#d8ff38] font-bold">★ Latest Free Models ($0/1M)</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#byoai" className="hover:text-[#d8ff38]">✦ BYOAI: Bring Your Own AI</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#platforms" className="hover:text-[#d8ff38]">Platforms (VS Code, CLI, Desktop)</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#features" className="hover:text-[#d8ff38]">Architectural Pillars</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#comparison" className="hover:text-[#d8ff38]">Comparison Battlecard</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#studio" className="hover:text-[#d8ff38]">Live Dev Studio</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#pricing" className="hover:text-[#d8ff38]">Pricing &amp; Dual-Licensing</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#faq" className="hover:text-[#d8ff38]">Frequently Asked Questions</a>
          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            <a
              href="https://app.oynx.si"
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
