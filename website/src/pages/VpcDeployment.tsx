import React from 'react'
import { Server, Shield, CheckCircle2, ArrowLeft, ArrowRight, Lock, Network, Database } from 'lucide-react'

export const VpcDeployment: React.FC = () => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#162e24] text-[#22c55e] text-xs font-mono mb-4 border border-[#22c55e]/30">
            <Network className="w-3.5 h-3.5" />
            <span>ENTERPRISE PRIVATE INFRASTRUCTURE · AIR-GAPPED</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Self-Hosted Private VPC &amp; On-Premise Deployment
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Deploy the complete Onyx Autonomous Studio inside your private AWS VPC, GCP project, Azure tenant, or air-gapped bare-metal datacenter. Absolute zero data egress.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d8ff38] hover:bg-[#cbf52b] text-[#07080a] font-bold text-xs transition-all shadow-[0_0_20px_rgba(216,255,56,0.25)]"
            >
              <span>Request VPC Deployment Spec</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Architecture Specs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#1b2212] text-[#d8ff38] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Zero Data Egress</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All agent processes, AST compilations, and model context remain inside your internal subnets. Zero telemetry or telemetry signals leave your perimeter.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#122418] text-[#22c55e] flex items-center justify-center mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Private MicroVM Runners</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Spin up autonomous microVM runners within your Kubernetes cluster using standard Helm charts or Terraform modules.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#10202c] text-[#38bdf8] flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Internal LLM Serving</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect to self-hosted vLLM, Ollama, or Hugging Face TGI nodes hosting open-weight models (DeepSeek R1, Qwen 2.5) with zero internet access required.
            </p>
          </div>
        </div>

        {/* Deployment Diagram / Code snippet */}
        <div className="p-8 rounded-2xl bg-[#0c0e14] border border-white/[0.08] font-mono text-xs">
          <div className="text-zinc-500 pb-3 border-b border-white/[0.06] mb-4">
            HELM DEPLOYMENT MANIFEST (onyx-cluster.yaml)
          </div>
          <div className="space-y-1.5 text-zinc-400">
            <p className="text-[#38bdf8]">apiVersion: <span className="text-white">apps/v1</span></p>
            <p className="text-[#38bdf8]">kind: <span className="text-white">Deployment</span></p>
            <p className="text-[#38bdf8]">metadata:</p>
            <p className="pl-4 text-zinc-300">name: onyx-enterprise-runner</p>
            <p className="pl-4 text-zinc-300">namespace: internal-ai-platform</p>
            <p className="text-[#38bdf8]">spec:</p>
            <p className="pl-4 text-zinc-300">replicas: 4</p>
            <p className="pl-4 text-zinc-300">env:</p>
            <p className="pl-8 text-zinc-400">- name: ONYX_TELEMETRY_DISABLED</p>
            <p className="pl-10 text-[#22c55e]">value: "true"</p>
            <p className="pl-8 text-zinc-400">- name: ONYX_INTERNAL_VLLM_URL</p>
            <p className="pl-10 text-white">value: "http://vllm-cluster.internal:8000"</p>
            <p className="text-[#22c55e] mt-4"># Ready for automated deployment via Helm / ArgoCD</p>
          </div>
        </div>

      </div>
    </div>
  )
}
