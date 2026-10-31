import React from 'react'
import { Shield, ArrowLeft, GitBranch, ArrowRight } from 'lucide-react'

export const License: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <div className="mb-6">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
        </div>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#162e24] text-[#22c55e] text-xs font-mono mb-4 border border-[#22c55e]/30">
            <Shield className="w-3.5 h-3.5" />
            <span>OPEN-SOURCE COMMUNITY FOUNDATION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
            GNU Affero General Public License v3.0 (AGPL-3.0)
          </h1>
          <p className="text-zinc-400 text-sm font-mono">
            Copyright (C) 2026 Manash Dash &amp; Onyx Open-Source Contributors.
          </p>
        </div>

        {/* Dual-Licensing Callout */}
        <div className="mb-8 p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#d8ff38] font-bold mb-1">NEED A COMMERCIAL EXEMPTION?</div>
            <p className="text-xs text-zinc-300">
              For proprietary closed-source deployment, white-labeling, or enterprise VPC hosting without AGPL Section 13 copyleft obligations.
            </p>
          </div>
          <a
            href="/eula"
            className="px-4 py-2 rounded-xl bg-[#d8ff38] text-[#07080a] font-bold text-xs shrink-0 hover:bg-[#cbf52b] transition-all flex items-center gap-1.5"
          >
            <span>View Commercial EULA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* AGPL Key Terms */}
        <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08] mb-8 font-mono text-xs text-zinc-300 leading-relaxed space-y-4">
          <div className="text-white font-bold text-sm border-b border-white/[0.06] pb-2">
            Key AGPL-3.0 Protections:
          </div>
          <p>
            • <strong className="text-white">Freedom to Run &amp; Modify:</strong> You have the freedom to run, inspect, and modify the Onyx platform source code.
          </p>
          <p>
            • <strong className="text-white">Section 13 (Remote Network Interaction):</strong> If you modify the program and run it on a network server (SaaS), you must give users who interact with it the opportunity to receive the corresponding source code of your modified version.
          </p>
          <p>
            • <strong className="text-white">Patent &amp; Contributor Grants:</strong> All contributions carry an irrevocable, royalty-free patent grant protecting users against patent infringement claims.
          </p>
        </div>

        {/* Raw License Text Container */}
        <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] font-mono text-[11px] text-zinc-400 h-96 overflow-y-auto leading-relaxed">
          <pre className="whitespace-pre-wrap font-mono">
                    GNU AFFERO GENERAL PUBLIC LICENSE
                       Version 3, 19 November 2007

 Copyright (C) 2007 Free Software Foundation, Inc. &lt;https://fsf.org/&gt;
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

                            Preamble

  The GNU Affero General Public License is a free, copyleft license for
software and other kinds of works, specifically designed to ensure
cooperation with the community in the case of network server software.

  The licenses for most software and other practical works are designed
to take away your freedom to share and change the works.  By contrast,
our General Public Licenses are intended to guarantee your freedom to
share and change all versions of a program--to make sure it remains free
software for all its users.

  When we speak of free software, we are referring to freedom, not
price.  Our General Public Licenses are designed to make sure that you
have the freedom to distribute copies of free software (and charge for
them if you wish), that you receive source code or can get it if you
want it, that you can change the software or use pieces of it in new
free programs, and that you know you can do these things.

  Developers that use our General Public Licenses protect your rights
with two steps: (1) assert copyright on the software, and (2) offer
you this License which gives you legal permission to copy, distribute
and/or modify the software.
          </pre>
        </div>

      </div>
    </div>
  )
}
