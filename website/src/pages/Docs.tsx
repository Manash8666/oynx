import React, { useState } from 'react'
import { Terminal, BookOpen, Layers, Cpu, Server, Key, ArrowLeft, ExternalLink, Check, Copy } from 'lucide-react'

export const Docs: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCmd(id)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

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
        <div className="mb-12 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b2212] text-[#d8ff38] text-xs font-mono mb-4 border border-[#d8ff38]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ONYX ENTERPRISE DOCUMENTATION &amp; CLI MANUAL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Developer Documentation &amp; CLI Reference
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Complete guide to running Onyx locally, configuring zero-marginal-cost BYOAI inference, orchestrating autonomous cloud microVMs, and integrating MCP tool servers.
          </p>
        </div>

        {/* Section 1: Quickstart & CLI Engine */}
        <div className="mb-12 p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-[#d8ff38]" />
            <span>1. CLI Engine Quickstart (`onyx`)</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
            Onyx compiles into a single, high-performance binary with zero external runtime dependencies. Once installed, the `onyx` command is available system-wide:
          </p>

          <div className="space-y-4">
            {/* Command 1 */}
            <div className="p-4 rounded-xl bg-[#07080a] border border-white/[0.06] font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span>Start Interactive Autonomous Studio</span>
                <button
                  onClick={() => copyToClipboard('onyx', 'cmd1')}
                  className="hover:text-white transition-colors"
                >
                  {copiedCmd === 'cmd1' ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[#d8ff38] font-bold">onyx</div>
              <div className="text-zinc-500 mt-1"># Launches high-speed reactive TUI in current working directory</div>
            </div>

            {/* Command 2 */}
            <div className="p-4 rounded-xl bg-[#07080a] border border-white/[0.06] font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span>Run Autonomous Headless Task</span>
                <button
                  onClick={() => copyToClipboard('onyx run "Audit JWT auth middleware and add unit tests"', 'cmd2')}
                  className="hover:text-white transition-colors"
                >
                  {copiedCmd === 'cmd2' ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[#d8ff38] font-bold">onyx run "Audit JWT auth middleware and add unit tests"</div>
              <div className="text-zinc-500 mt-1"># Clones worktree, generates code, verifies AST, and runs tests</div>
            </div>

            {/* Command 3 */}
            <div className="p-4 rounded-xl bg-[#07080a] border border-white/[0.06] font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span>List Available AI Foundation Models</span>
                <button
                  onClick={() => copyToClipboard('onyx models', 'cmd3')}
                  className="hover:text-white transition-colors"
                >
                  {copiedCmd === 'cmd3' ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[#d8ff38] font-bold">onyx models</div>
              <div className="text-zinc-500 mt-1"># Lists connected models across Anthropic, DeepSeek, OpenAI, Ollama</div>
            </div>
          </div>
        </div>

        {/* Section 2: BYOAI Provider Configuration */}
        <div className="mb-12 p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
            <Key className="w-5 h-5 text-[#22c55e]" />
            <span>2. Zero-Marginal-Cost BYOAI Configuration</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
            Onyx never marks up token costs. Connect your direct upstream API keys or point to a local Ollama/vLLM server:
          </p>

          <div className="p-5 rounded-xl bg-[#07080a] border border-white/[0.06] font-mono text-xs leading-relaxed text-zinc-300">
            <p className="text-zinc-500 mb-3"># Set environment variables or use 'onyx auth'</p>
            <p><span className="text-[#38bdf8]">export</span> ANTHROPIC_API_KEY="sk-ant-api03-..."</p>
            <p><span className="text-[#38bdf8]">export</span> DEEPSEEK_API_KEY="sk-..."</p>
            <p><span className="text-[#38bdf8]">export</span> OPENAI_API_KEY="sk-proj-..."</p>
            <p className="text-zinc-500 mt-3"># Local Offline Inference with Ollama</p>
            <p><span className="text-[#38bdf8]">export</span> OLLAMA_HOST="http://127.0.0.1:11434"</p>
            <p className="text-[#22c55e] mt-3">✓ Onyx automatically routes inference requests with zero intermediary toll</p>
          </div>
        </div>

        {/* Section 3: ACP & MCP Protocols */}
        <div className="p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#38bdf8]" />
            <span>3. Model Context Protocol (MCP) &amp; Agent Client Protocol (ACP)</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
            Onyx implements open agentic standards. You can bind external database, terminal, browser, and GitHub tools seamlessly:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#07080a] border border-white/[0.04]">
              <div className="text-white font-bold mb-2">onyx mcp add &lt;server&gt;</div>
              <p className="text-zinc-400 leading-relaxed">
                Connects any standard MCP server (PostgreSQL, Puppeteer, Docker, Slack, Linear) into the agent's tool execution graph.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#07080a] border border-white/[0.04]">
              <div className="text-white font-bold mb-2">onyx acp</div>
              <p className="text-zinc-400 leading-relaxed">
                Starts the Agent Client Protocol daemon, allowing external IDEs (VS Code, JetBrains, Zed) to pilot the Onyx engine.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
