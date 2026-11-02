import React from 'react'
import { OnyxLogo } from '../components/icons'
import { Terminal, Cpu, Shield, Layers, HardDrive, Play, ArrowUpRight, Activity } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07080a] text-white flex flex-col font-sans">
      {/* Navigation Header with explicit role="navigation" */}
      <nav role="navigation" className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#07080a]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2.5">
            <OnyxLogo className="w-7 h-7 text-[#d8ff38]" />
            <span className="font-bold text-lg tracking-tight font-mono">ONYX CLOUD</span>
          </a>
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-zinc-400">
            <a href="/dashboard" className="text-white hover:text-[#d8ff38] transition-colors">Overview</a>
            <a href="/cloud-agent" className="hover:text-white transition-colors">Agent Lucifer</a>
            <a href="/settings" className="hover:text-white transition-colors">Settings</a>
            <a href="/docs" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#122418] border border-[#22c55e]/30 text-[#22c55e] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span>Firecracker uVM Active</span>
          </div>
          <a
            href="https://app.oynx.si/cloud-agent"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d8ff38] text-[#07080a] text-xs font-bold font-mono hover:bg-[#cbf52b] transition-all"
          >
            <span>Launch Workbench</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0b0e14] border border-white/[0.08] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#162e24] text-[#22c55e] text-xs font-mono mb-3">
                <Activity className="w-3.5 h-3.5" />
                <span>WORKSPACE ID: ONYX-PROD-01</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Enterprise Cloud Engineering Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                Real-time telemetries across Agent Lucifer quad-cortex execution, in-process Tree-Sitter AST compiler checks, and ephemeral Firecracker microVM execution.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-[#12151d] border border-white/[0.08] text-zinc-300">
                0% Token Tax
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-[#12151d] border border-white/[0.08] text-[#d8ff38]">
                BYOAI: Local + Hosted
              </span>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#0b0e14] border border-white/[0.08]">
            <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs font-mono">
              <span>ACTIVE COGNITIVE CORTEX</span>
              <Cpu className="w-4 h-4 text-[#d8ff38]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">Quad-Cortex</div>
            <div className="text-[11px] text-[#22c55e] mt-1 font-mono">DeepSeek + Qwen + Nemotron</div>
          </div>
          <div className="p-5 rounded-xl bg-[#0b0e14] border border-white/[0.08]">
            <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs font-mono">
              <span>AST COMPILER PASS RATE</span>
              <Shield className="w-4 h-4 text-[#22c55e]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">100.0%</div>
            <div className="text-[11px] text-zinc-400 mt-1 font-mono">0 Syntax Errors / 37 LSPs</div>
          </div>
          <div className="p-5 rounded-xl bg-[#0b0e14] border border-white/[0.08]">
            <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs font-mono">
              <span>CONTEXT COMPRESSION</span>
              <Layers className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">-85.0%</div>
            <div className="text-[11px] text-[#38bdf8] mt-1 font-mono">Repomix + Multimodal AST</div>
          </div>
          <div className="p-5 rounded-xl bg-[#0b0e14] border border-white/[0.08]">
            <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs font-mono">
              <span>CONNECTED TOOLS (MCP)</span>
              <HardDrive className="w-4 h-4 text-[#a855f7]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">250+</div>
            <div className="text-[11px] text-zinc-400 mt-1 font-mono">Nango &amp; Activepieces</div>
          </div>
        </div>
      </main>
    </div>
  )
}
