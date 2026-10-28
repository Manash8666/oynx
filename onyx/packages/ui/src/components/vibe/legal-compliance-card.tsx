import { createSignal } from "solid-js"

export interface LegalComplianceProps {
  readonly license?: string
  readonly hasCopyleftRisk?: boolean
  readonly hasTOSViolationRisk?: boolean
  readonly isCommercialSafe?: boolean
  readonly recommendation?: string
}

export function LegalComplianceCard(props: LegalComplianceProps) {
  const isSafe = () => props.isCommercialSafe ?? true
  const isCopyleft = () => props.hasCopyleftRisk ?? false
  const isTOSViolation = () => props.hasTOSViolationRisk ?? false

  const statusColor = () => {
    if (isCopyleft() || isTOSViolation()) return "border-red-800/60 bg-red-950/40 text-red-300"
    if (!isSafe()) return "border-amber-800/60 bg-amber-950/40 text-amber-300"
    return "border-emerald-800/60 bg-emerald-950/40 text-emerald-300"
  }

  const statusTitle = () => {
    if (isCopyleft()) return "🚨 AGPL-3.0 Copyleft Hazard Detected"
    if (isTOSViolation()) return "⚠️ Unauthorized Scraper / TOS Risk"
    if (!isSafe()) return "⚠️ Conditional Commercial Terms"
    return "✅ Commercial Safe (Permissive License)"
  }

  return (
    <div class={`vibe-legal-card p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${statusColor()}`}>
      <div class="flex items-center justify-between font-semibold">
        <span>{statusTitle()}</span>
        <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40">
          {props.license ?? "MIT"}
        </span>
      </div>
      <p class="text-[11px] opacity-90 leading-relaxed">
        {props.recommendation ?? "Permissible for proprietary SaaS and commercial application distribution."}
      </p>
    </div>
  )
}
