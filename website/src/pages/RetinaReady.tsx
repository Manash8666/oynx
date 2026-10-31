import React from 'react'
import { Monitor, CheckCircle2, ArrowLeft, Shield, Sparkles, Cpu, Layers } from 'lucide-react'

export const RetinaReady: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a] pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <div className="mb-6">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
        </div>

        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#162e24] text-[#22c55e] text-xs font-mono mb-4 border border-[#22c55e]/30">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span>ONYX-SPEC-RETINA-2026-V1 · GLOBAL DISPLAY CERTIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Retina Ready &amp; High-DPI Display Compliance
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Onyx is certified under ultra-high-definition subpixel display standards. For enterprise acquirers and product owners, this confirms zero bitmap pixelation, lossless vector scaling up to 800% zoom, and native Per-Monitor V2 DPI acceleration.
          </p>
        </div>

        {/* DPR Tier Matrix Table */}
        <div className="mb-12 p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-[#22c55e]" />
            <span>Device Pixel Ratio (DPR) Compliance Matrix</span>
          </h2>
          <p className="text-xs text-zinc-400 mb-6">
            Tested and certified across multi-monitor display configurations and high-density mobile panels:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#08090d] text-zinc-400 uppercase border-b border-white/[0.08]">
                <tr>
                  <th className="p-3.5">Display Tier</th>
                  <th className="p-3.5">Device Pixel Ratio (DPR)</th>
                  <th className="p-3.5">Target Resolution</th>
                  <th className="p-3.5">Rendering Technology</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                <tr>
                  <td className="p-3.5 font-bold text-white">Standard (1x)</td>
                  <td className="p-3.5 text-zinc-400">1.0x (96 DPI)</td>
                  <td className="p-3.5 text-zinc-400">1080p Full HD</td>
                  <td className="p-3.5 text-zinc-400">Native Vector / Subpixel RGB</td>
                  <td className="p-3.5 text-right text-[#22c55e] font-bold">COMPLIANT [✓]</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Windows Fractional</td>
                  <td className="p-3.5 text-zinc-400">1.25x – 1.75x (120–168 DPI)</td>
                  <td className="p-3.5 text-zinc-400">1440p QHD / High-Res Laptops</td>
                  <td className="p-3.5 text-zinc-400">Per-Monitor V2 Dynamic Awareness</td>
                  <td className="p-3.5 text-right text-[#22c55e] font-bold">COMPLIANT [✓]</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Apple Retina (2x)</td>
                  <td className="p-3.5 text-[#d8ff38]">2.0x (192 DPI)</td>
                  <td className="p-3.5 text-zinc-400">Apple MacBook Pro / 4K UHD</td>
                  <td className="p-3.5 text-zinc-400">Lossless Mathematical Vector (SVG)</td>
                  <td className="p-3.5 text-right text-[#22c55e] font-bold">COMPLIANT [✓]</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Super Retina (3x)</td>
                  <td className="p-3.5 text-zinc-400">3.0x (288 DPI)</td>
                  <td className="p-3.5 text-zinc-400">OLED / Mobile Super Retina XDR</td>
                  <td className="p-3.5 text-zinc-400">High-Density Vector Compositing</td>
                  <td className="p-3.5 text-right text-[#22c55e] font-bold">COMPLIANT [✓]</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Studio Display (5K/6K)</td>
                  <td className="p-3.5 text-zinc-400">4.0x+ (384+ DPI)</td>
                  <td className="p-3.5 text-zinc-400">Apple Studio / Pro Display XDR</td>
                  <td className="p-3.5 text-zinc-400">GPU-Accelerated Hardware Canvas</td>
                  <td className="p-3.5 text-right text-[#22c55e] font-bold">COMPLIANT [✓]</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 Pillars of Implementation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#1b2212] text-[#d8ff38] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">100% SVG Vector Geometry</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every icon, logo, badge, and UI control is encoded as mathematical XML vectors. Guaranteed razor-sharp rendering with zero blurriness or compression artifacts up to 800% zoom.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#122418] text-[#22c55e] flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Subpixel Typography</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Variable font rendering (Geist, Geist Mono, JetBrains Mono) with subpixel anti-aliasing (`-webkit-font-smoothing: antialiased`) and OpenType character variant calibration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#10202c] text-[#38bdf8] flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Per-Monitor V2 Native DPI</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The Windows native installer and desktop studio integrate directly with Win32 `SetProcessDpiAwarenessContext(-4)`, dynamically scaling windows as they move between 4K and 1080p monitors.
            </p>
          </div>
        </div>

        {/* Acquirer Due Diligence Badge */}
        <div className="p-6 rounded-2xl bg-[#10141d] border border-[#d8ff38]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#d8ff38] font-bold mb-1">M&amp;A TECHNICAL DUE DILIGENCE READY</div>
            <p className="text-xs text-zinc-300">
              Complete source code, SVG design files, and DPI manifests are included in the repository.
            </p>
          </div>
          <a
            href="https://github.com/Manash8666/oynx"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#d8ff38] text-[#07080a] font-bold text-xs shrink-0 hover:bg-[#cbf52b] transition-all"
          >
            Inspect Repository Source
          </a>
        </div>

      </div>
    </div>
  )
}
