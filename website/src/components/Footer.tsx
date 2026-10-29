import React from 'react'
import { Shield, FileText } from 'lucide-react'
import { GithubIcon, OnyxLogo } from './icons'

export const Footer: React.FC = () => {
  return (
    <footer className="py-14 px-4 border-t border-white/[0.08] bg-anthracite-base text-xs font-mono-code text-zinc-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Author */}
        <div className="flex items-center gap-3">
          <OnyxLogo size={28} className="shadow-sm" />
          <div>
            <span className="text-zinc-200 font-semibold font-sans text-sm">Onyx</span>
            <span className="text-zinc-600 ml-2 font-mono">v1.0.0</span>
            <p className="text-[11px] text-zinc-500 font-sans">
              Engineered by <strong className="text-zinc-300">Manash Dash</strong> &amp; Onyx Open-Source Contributors.
            </p>
          </div>
        </div>

        {/* Legal & Compliance Links */}
        <div className="flex flex-wrap items-center gap-6 text-zinc-400">
          <a
            href="https://github.com/Manash8666/oynx/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d8ff38] transition-colors flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5" /> AGPL-3.0 License
          </a>
          <a
            href="https://github.com/Manash8666/oynx/blob/main/COMPLIANCE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d8ff38] transition-colors flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> Compliance
          </a>
          <a
            href="https://github.com/Manash8666/oynx/blob/main/EULA.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d8ff38] transition-colors flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> Commercial EULA
          </a>
          <a
            href="https://github.com/Manash8666/oynx.git"
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
