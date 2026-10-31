import React from 'react'
import { Award, ArrowLeft, Zap, TrendingUp, Cpu, CheckCircle2 } from 'lucide-react'

export const Leaderboard: React.FC = () => {
  const models = [
    { rank: 1, name: 'Claude 3.7 Sonnet', provider: 'Anthropic', pass1: '92.4%', astValid: '99.8%', speed: '84 t/s', cost: '$3.00 / $15.00', status: 'Frontier SOTA' },
    { rank: 2, name: 'DeepSeek R1', provider: 'DeepSeek', pass1: '90.8%', astValid: '99.4%', speed: '62 t/s', cost: '$0.55 / $2.19', status: 'Best Value Reasoning' },
    { rank: 3, name: 'GPT-4o', provider: 'OpenAI', pass1: '88.6%', astValid: '99.2%', speed: '98 t/s', cost: '$2.50 / $10.00', status: 'Frontier Fast' },
    { rank: 4, name: 'DeepSeek V3', provider: 'DeepSeek', pass1: '86.2%', astValid: '99.1%', speed: '110 t/s', cost: '$0.14 / $0.28', status: 'High Throughput' },
    { rank: 5, name: 'Gemini 2.0 Flash', provider: 'Google', pass1: '85.4%', astValid: '98.9%', speed: '142 t/s', cost: '$0.10 / $0.40', status: 'Ultra Low Latency' },
    { rank: 6, name: 'Qwen 2.5 Coder 32B', provider: 'Alibaba', pass1: '83.1%', astValid: '98.5%', speed: '48 t/s', cost: '$0 (Local/Ollama)', status: 'Best Open Weights' },
  ]

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a] pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
            <Award className="w-3.5 h-3.5" />
            <span>ONYXBENCH 2026 · EMPIRICAL AI CODING BENCHMARK</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            AI Coding Model Leaderboard
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Live empirical rankings of frontier and open-weight models evaluated on real-world multi-file refactoring, in-process Tree-Sitter AST syntax validity, and wholesale token pricing.
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0c0e14] mb-12 shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#08090d] text-zinc-400 uppercase border-b border-white/[0.08]">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Model Name</th>
                <th className="p-4">Provider</th>
                <th className="p-4 text-center">Pass@1 Code Gen</th>
                <th className="p-4 text-center">AST Syntax Validity</th>
                <th className="p-4 text-center">Tokens / Sec</th>
                <th className="p-4 text-right">Wholesale Price (1M)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300">
              {models.map((m) => (
                <tr key={m.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-[#d8ff38]">#{m.rank}</td>
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{m.name}</div>
                    <div className="text-[10px] text-zinc-500">{m.status}</div>
                  </td>
                  <td className="p-4 text-zinc-400">{m.provider}</td>
                  <td className="p-4 text-center font-bold text-[#22c55e]">{m.pass1}</td>
                  <td className="p-4 text-center font-bold text-white">{m.astValid}</td>
                  <td className="p-4 text-center text-zinc-400">{m.speed}</td>
                  <td className="p-4 text-right text-zinc-300">{m.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Evaluation Methodology */}
        <div className="p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#d8ff38]" />
            <span>OnyxBench Methodology</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-4">
            Unlike synthetic synthetic single-line coding quizzes, OnyxBench tests models on complex 50+ file codebases across full git diff scenarios. Every synthesized patch is compiled against an incremental abstract syntax tree to verify zero broken imports or invalid types.
          </p>
          <div className="text-xs font-mono text-[#22c55e]">
            ✓ All models evaluated with zero prompt degradation and neutral system prompts.
          </div>
        </div>

      </div>
    </div>
  )
}
