import React from 'react'
import { Shield, FileText, Monitor } from 'lucide-react'
import { GithubIcon, OnyxLogo } from './icons'

export const Footer: React.FC = () => {
  const navigateTo = (path: string, e: React.MouseEvent) => {
    e.preventDefault()
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <footer className="py-14 px-4 border-t border-white/[0.08] bg-anthracite-base text-xs font-mono-code text-zinc-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Author */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => navigateTo('/', e)}
            className="flex items-center gap-3 group"
          >
            <OnyxLogo size={28} className="shadow-sm transition-transform group-hover:scale-105" />
            <div>
              <span className="text-zinc-200 font-semibold font-sans text-sm group-hover:text-white transition-colors">Onyx</span>
              <span className="text-zinc-600 ml-2 font-mono">v1.0.0</span>
              <p className="text-[11px] text-zinc-500 font-sans">
                Engineered by <strong className="text-zinc-300">Manash Dash</strong> &amp; Onyx Open-Source Contributors.
              </p>
            </div>
          </a>
        </div>

        {/* In-App Legal & Compliance Pages (No raw GitHub redirects) */}
        <div className="flex flex-wrap items-center gap-6 text-zinc-400">
          <a
            href="/license"
            onClick={(e) => navigateTo('/license', e)}
            className="hover:text-[#d8ff38] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" /> AGPL-3.0 License
          </a>
          <a
            href="/compliance"
            onClick={(e) => navigateTo('/compliance', e)}
            className="hover:text-[#d8ff38] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Compliance
          </a>
          <a
            href="/retina-ready"
            onClick={(e) => navigateTo('/retina-ready', e)}
            className="hover:text-[#22c55e] text-emerald-400/90 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5 text-[#22c55e]" /> Retina Ready
          </a>
          <a
            href="/eula"
            onClick={(e) => navigateTo('/eula', e)}
            className="hover:text-[#d8ff38] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Commercial EULA
          </a>
          <a
            href="https://github.com/Manash8666/oynx"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d8ff38] transition-colors flex items-center gap-1"
          >
            <GithubIcon className="w-3.5 h-3.5" /> GitHub
          </a>
        </div>
      </div>

      {/* Customer IP Ownership Statement */}
      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-white/[0.06] text-[11px] text-zinc-500 text-center md:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          Onyx guarantees that all customer-generated code, software, and artifacts remain <strong className="text-zinc-300 font-semibold">100% the undivided intellectual property of the customer</strong>.
        </div>
        <div className="text-zinc-600">
          Copyright &copy; {new Date().getFullYear()} Manash Dash. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
