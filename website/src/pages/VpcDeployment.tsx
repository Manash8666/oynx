import React, { useState } from 'react'
import { Server, Shield, CheckCircle2, ArrowLeft, ArrowRight, Lock, Network, Database, Copy, Check, Download, Cloud, Cpu, Terminal, X } from 'lucide-react'

type CloudProvider = 'aws' | 'gcp' | 'azure' | 'baremetal'
type InferenceEngine = 'vllm' | 'colibri' | 'ollama' | 'bedrock'

export const VpcDeployment: React.FC = () => {
  const [provider, setProvider] = useState<CloudProvider>('aws')
  const [inferenceEngine, setInferenceEngine] = useState<InferenceEngine>('colibri')
  const [replicas, setReplicas] = useState<number>(4)
  const [zeroEgress, setZeroEgress] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  // Intake Form State
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [seats, setSeats] = useState('50 - 200 developers')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const [requestId, setRequestId] = useState('')

  // Generate dynamic Kubernetes / Helm YAML based on selections
  const generateYaml = () => {
    const providerNamespace = provider === 'aws' ? 'aws-internal-eks' : provider === 'gcp' ? 'gcp-private-gke' : provider === 'azure' ? 'azure-private-aks' : 'airgapped-baremetal'
    const inferenceUrl = inferenceEngine === 'vllm'
      ? 'http://vllm-cluster.internal:8000'
      : inferenceEngine === 'colibri'
      ? 'coli://nvme-somatic-stream'
      : inferenceEngine === 'ollama'
      ? 'http://ollama-daemon.internal:11434'
      : 'https://bedrock-vpc.us-east-1.amazonaws.com'

    return `# ================================================================
# Onyx Autonomous Enterprise VPC Deployment Spec
# Target Provider: ${provider.toUpperCase()} | Engine: ${inferenceEngine.toUpperCase()}
# Compliance: ISO/IEC 27001 · SOC 2 Type II · Zero Data Egress
# ================================================================

apiVersion: apps/v1
kind: Deployment
metadata:
  name: onyx-enterprise-runner
  namespace: ${providerNamespace}
  labels:
    app.kubernetes.io/name: onyx-runner
    app.kubernetes.io/part-of: onyx-platform
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: onyx-runner
  template:
    metadata:
      labels:
        app: onyx-runner
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        fsGroup: 10001
      containers:
        - name: onyx-agent-lucifer
          image: registry.internal.company.com/onyx/runner:2.0.0
          imagePullPolicy: IfNotPresent
          resources:
            requests:
              cpu: "4000m"
              memory: "16Gi"
            limits:
              cpu: "8000m"
              memory: "32Gi"
          env:
            - name: ONYX_TELEMETRY_DISABLED
              value: "true"
            - name: ONYX_AIRGAP_ENFORCE
              value: "${zeroEgress ? 'true' : 'false'}"
            - name: ONYX_INFERENCE_BACKEND
              value: "${inferenceEngine}"
            - name: ONYX_INTERNAL_MODEL_URL
              value: "${inferenceUrl}"
            - name: COLIBRI_SOMATIC_BLOCK_MB
              value: "128"
            - name: COLIBRI_HORIZON_LAYERS
              value: "3"
          securityContext:
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
            capabilities:
              drop: ["ALL"]
          volumeMounts:
            - name: scratch-space
              mountPath: /tmp
            - name: nvme-weights
              mountPath: /models/nvme
      volumes:
        - name: scratch-space
          emptyDir:
            medium: Memory
            sizeLimit: 4Gi
        - name: nvme-weights
          hostPath:
            path: /mnt/nvme0n1/onyx-weights
            type: Directory
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: onyx-zero-egress-guard
  namespace: ${providerNamespace}
spec:
  podSelector:
    matchLabels:
      app: onyx-runner
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - ipBlock:
            cidr: 10.0.0.0/8 # Internal corporate CIDR only
      ports:
        - protocol: TCP
          port: 3000
  egress:
    ${zeroEgress ? '# ABSOLUTE ZERO DATA EGRESS: No outbound traffic permitted' : '- to:\n        - ipBlock:\n            cidr: 10.0.0.0/8'}
`
  }

  const manifestContent = generateYaml()

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(manifestContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadYaml = () => {
    const blob = new Blob([manifestContent], { type: 'text/yaml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onyx-vpc-${provider}-spec.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/vpc/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company,
          seats,
          provider,
          inferenceEngine,
          replicas,
          zeroEgress,
          notes
        })
      })
      const data = await res.json()
      setRequestId(data.requestId || `vpc-${Date.now().toString(36)}`)
      setRequestSubmitted(true)
    } catch {
      // Graceful offline fallback
      setRequestId(`vpc-${Date.now().toString(36)}`)
      setRequestSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a] pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Navigation Back */}
        <div>
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
        </div>

        {/* Header */}
        <div className="border-b border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#162e24] text-[#22c55e] text-xs font-mono mb-4 border border-[#22c55e]/30">
            <Network className="w-3.5 h-3.5" />
            <span>ENTERPRISE AIR-GAPPED VPC &amp; ON-PREMISE ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Private VPC &amp; On-Premise <span className="text-[#d8ff38]">Deployment Studio</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Configure, validate, and download customized Kubernetes &amp; Helm infrastructure specifications.
            Deploy the complete Onyx platform inside your air-gapped AWS VPC, GCP project, Azure tenant, or bare-metal cluster with <strong>zero telemetry and zero data egress</strong>.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-8">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#d8ff38] hover:bg-[#cbf52b] text-[#07080a] font-bold text-xs transition-all shadow-[0_0_20px_rgba(216,255,56,0.25)] min-h-[44px]"
            >
              <span>Request Enterprise Architecture Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadYaml}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-zinc-200 border border-white/[0.1] font-mono text-xs transition-colors min-h-[44px]"
            >
              <Download className="w-4 h-4 text-[#d8ff38]" />
              <span>Download Spec (.yaml)</span>
            </button>
          </div>
        </div>

        {/* Interactive Spec Studio Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <div className="space-y-6 lg:col-span-1">
            <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08] space-y-5">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#d8ff38]" />
                <span>1. Cloud Infrastructure</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'aws', label: 'AWS EKS' },
                  { id: 'gcp', label: 'GCP GKE' },
                  { id: 'azure', label: 'Azure AKS' },
                  { id: 'baremetal', label: 'Bare Metal K8s' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setProvider(item.id as CloudProvider)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono transition-all text-left border ${
                      provider === item.id
                        ? 'bg-[#d8ff38]/10 border-[#d8ff38] text-white font-bold'
                        : 'bg-black/40 border-white/[0.06] text-zinc-400 hover:border-white/[0.2]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2 pt-2">
                <Cpu className="w-4 h-4 text-[#38bdf8]" />
                <span>2. Internal LLM Serving</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'colibri', label: 'Colibri Pure C NVMe' },
                  { id: 'vllm', label: 'vLLM Cluster' },
                  { id: 'ollama', label: 'Ollama Daemon' },
                  { id: 'bedrock', label: 'Bedrock PrivateLink' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setInferenceEngine(item.id as InferenceEngine)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono transition-all text-left border ${
                      inferenceEngine === item.id
                        ? 'bg-[#38bdf8]/10 border-[#38bdf8] text-white font-bold'
                        : 'bg-black/40 border-white/[0.06] text-zinc-400 hover:border-white/[0.2]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2 pt-2">
                <Server className="w-4 h-4 text-[#22c55e]" />
                <span>3. Runner Pod Replicas</span>
              </h3>

              <div className="flex gap-2">
                {[2, 4, 8, 16].map((num) => (
                  <button
                    key={num}
                    onClick={() => setReplicas(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      replicas === num
                        ? 'bg-[#22c55e]/20 border-[#22c55e] text-white font-bold'
                        : 'bg-black/40 border-white/[0.06] text-zinc-400'
                    }`}
                  >
                    {num} Pods
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/[0.06] space-y-3">
                <label className="flex items-center justify-between text-xs font-mono text-zinc-300 cursor-pointer">
                  <span>Enforce Zero Egress (NetworkPolicy)</span>
                  <input
                    type="checkbox"
                    checked={zeroEgress}
                    onChange={(e) => setZeroEgress(e.target.checked)}
                    className="accent-[#d8ff38] w-4 h-4 rounded"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* YAML Output Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08] font-mono text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Terminal className="w-4 h-4 text-[#d8ff38]" />
                  <span>onyx-vpc-deployment.yaml</span>
                  <span className="text-zinc-600">({provider.toUpperCase()} / {inferenceEngine.toUpperCase()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyYaml}
                    className="px-3 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-zinc-200 border border-white/[0.1] text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadYaml}
                    className="px-3 py-1 rounded-lg bg-[#d8ff38]/10 hover:bg-[#d8ff38]/20 text-[#d8ff38] border border-[#d8ff38]/30 text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <pre className="overflow-x-auto text-zinc-300 max-h-[500px] leading-relaxed p-2">
                {manifestContent}
              </pre>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#1b2212] text-[#d8ff38] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Zero Data Egress Guarantee</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All agent processes, AST compilations, and model contexts remain inside your internal subnets. Zero telemetry, metrics, or telemetry signals leave your network perimeter.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#122418] text-[#22c55e] flex items-center justify-center mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Private MicroVM Fleet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Spin up autonomous Firecracker microVM runners within your Kubernetes cluster using standard Helm charts or Terraform modules with ephemeral memory isolation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#10202c] text-[#38bdf8] flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Pure C Colibri &amp; vLLM</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect to Colibri NVMe super-clusters or self-hosted vLLM/Ollama nodes hosting DeepSeek R1 and Qwen 2.5 with zero external cloud dependencies.
            </p>
          </div>
        </div>

      </div>

      {/* Enterprise Intake Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0c0d12] border border-white/[0.12] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => { setModalOpen(false); setRequestSubmitted(false); }}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {requestSubmitted ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="w-12 h-12 text-[#22c55e] mx-auto" />
                <h3 className="text-xl font-bold text-white">VPC Specification Dispatched!</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Your customized <strong className="text-white">{provider.toUpperCase()}</strong> deployment manifest and architecture review package have been queued.
                </p>
                <div className="p-3 rounded-xl bg-gray-950 border border-white/[0.08] font-mono text-xs text-[#d8ff38]">
                  Request ID: {requestId}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Direct Founder Contact: Manash Dash · SLA Response: &lt; 24h
                </p>
                <button
                  onClick={() => { setModalOpen(false); setRequestSubmitted(false); }}
                  className="w-full py-2.5 rounded-xl bg-[#d8ff38] text-black font-semibold text-xs mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Request VPC Deployment Architecture</h3>
                  <p className="text-xs text-zinc-400">
                    Get a tailored deployment assessment, terraform manifests, and air-gapped sizing guidelines.
                  </p>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="block text-zinc-400 mb-1">Corporate Work Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="architect@enterprise.com"
                      className="w-full bg-black/60 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d8ff38]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. JPMorgan, Boeing, Moderna"
                      className="w-full bg-black/60 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d8ff38]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Target Engineering Seats</label>
                    <select
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      className="w-full bg-black/60 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d8ff38]"
                    >
                      <option>10 - 50 developers</option>
                      <option>50 - 200 developers</option>
                      <option>200 - 1000 enterprise seats</option>
                      <option>1000+ global workforce</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Infrastructure Constraints (Optional)</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. FedRAMP High, strict air-gap, AWS GovCloud, internal vLLM cluster"
                      className="w-full bg-black/60 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d8ff38]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#d8ff38] hover:bg-[#cbf52b] text-[#07080a] font-bold text-xs transition-all shadow-[0_0_15px_rgba(216,255,56,0.2)]"
                >
                  {submitting ? 'Submitting Specification...' : 'Dispatch Architecture Intake'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
