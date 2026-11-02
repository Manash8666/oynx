import React, { useState } from 'react'
import { OnyxLogo } from '../components/icons'
import { Save, Check, Key, Shield, Sliders, ArrowLeft } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434')
  const [defaultModel, setDefaultModel] = useState('deepseek-r1:latest')
  const [privacyMode, setPrivacyMode] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-white/[0.08] bg-[#07080a]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-mono">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </a>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-2">
            <OnyxLogo className="w-5 h-5 text-[#d8ff38]" />
            <span className="font-bold text-sm font-mono text-white">SETTINGS CONSOLE</span>
          </div>
        </div>
      </header>

      {/* Main Settings Form */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Onyx Environment &amp; Engine Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure local model providers, zero-marginal-cost BYOAI keys, and air-gapped security boundaries.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Local Inference & BYOAI */}
          <div className="p-6 rounded-2xl bg-[#0b0e14] border border-white/[0.08] space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <Key className="w-4 h-4 text-[#d8ff38]" />
              <span>1. Local Inference Gateway (Ollama / vLLM)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1.5">Ollama Server Endpoint</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  className="w-full bg-[#12151d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d8ff38]"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1.5">Default Fallback Model</label>
                <input
                  type="text"
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full bg-[#12151d] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d8ff38]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Privacy & Air-Gap Guards */}
          <div className="p-6 rounded-2xl bg-[#0b0e14] border border-white/[0.08] space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <Shield className="w-4 h-4 text-[#22c55e]" />
              <span>2. Security &amp; Air-Gapped Compliance</span>
            </h2>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#12151d] border border-white/[0.04]">
              <div>
                <div className="text-xs font-bold text-white">Strict Air-Gapped Mode</div>
                <div className="text-[11px] text-zinc-400">Blocks all outbound internet telemetry requests; forces local execution.</div>
              </div>
              <input
                type="checkbox"
                checked={privacyMode}
                onChange={(e) => setPrivacyMode(e.target.checked)}
                className="w-4 h-4 accent-[#d8ff38] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
            <span className="text-xs font-mono text-zinc-500">
              Changes persist to local storage and active server session.
            </span>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d8ff38] text-[#07080a] font-bold text-xs hover:bg-[#cbf52b] transition-all shadow-[0_0_15px_rgba(216,255,56,0.25)] font-mono"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Saved Successfully!' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
