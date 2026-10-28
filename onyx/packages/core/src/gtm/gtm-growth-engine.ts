export type GtmPhase =
  | "ICP_VALIDATION"
  | "VALUE_PROPOSITION"
  | "LANDING_PAGE_CRO"
  | "OUTBOUND_SEQUENCE"
  | "SEO_GROWTH_ENGINE"
  | "RETENTION_METRICS"

export interface GtmSprintMilestone {
  readonly phase: GtmPhase
  readonly name: string
  readonly description: string
  readonly deliverables: readonly string[]
  readonly validationGate: string
}

export interface CroAuditReport {
  readonly clarityScore: number // 0 to 100
  readonly ctaScore: number // 0 to 100
  readonly jargonPenalty: number // 0 to 50
  readonly overallRating: "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT" | "POOR"
  readonly recommendations: readonly string[]
}

export const GTM_PLAYBOOK_PHASES: readonly GtmSprintMilestone[] = [
  {
    phase: "ICP_VALIDATION",
    name: "Ideal Customer Profile & Pain Quantification",
    description: "Identify the exact buyer persona, existing budget allocations, and quantifiable pain points.",
    deliverables: ["ICP Persona Card", "Top 3 High-Urgency Pain Points", "Competitor Dissatisfaction Map"],
    validationGate: "At least 5 prospective customers confirm the pain point is actively painful.",
  },
  {
    phase: "VALUE_PROPOSITION",
    name: "Positioning & High-Converting Headline Synthesis",
    description: "Craft clear, evidence-based positioning that clearly communicates the before vs. after transformation.",
    deliverables: ["Primary Hero Headline", "Subheadline (How it works)", "Tiered Pricing Model"],
    validationGate: "5-second glance test: Strangers understand what the product does in under 5 seconds.",
  },
  {
    phase: "LANDING_PAGE_CRO",
    name: "Conversion-Rate-Optimized Page Architecture",
    description: "Structure landing pages using high-converting visual hierarchy, social proof, and low-friction CTAs.",
    deliverables: ["Hero Section", "Interactive Feature Cards", "Social Proof Block", "FAQ & Risk Reversal"],
    validationGate: "Interactive MotionSites component preview renders with zero CTA friction.",
  },
  {
    phase: "OUTBOUND_SEQUENCE",
    name: "Value-First Outbound Sales Sequencing",
    description: "Multi-touch, hyper-personalized email sequencing focusing on insights rather than hard selling.",
    deliverables: ["Trigger-Based Subject Lines", "Pain-Specific Email Body", "Follow-up Cadence (3 touches)"],
    validationGate: "No generic templates; each email references a specific verifiable trigger.",
  },
  {
    phase: "SEO_GROWTH_ENGINE",
    name: "High-Intent Organic Keyword Clusters",
    description: "Target high-intent, bottom-of-funnel search terms where buyers are actively looking for solutions.",
    deliverables: ["Primary Keyword Clusters", "Comparison Landing Pages vs Competitors", "Docs Guides"],
    validationGate: "Targeting keywords with high commercial intent over vanity volume.",
  },
  {
    phase: "RETENTION_METRICS",
    name: "Activation & User Retention Framework",
    description: "Track time-to-first-value (TTFV), day-1 activation rate, and recurring user engagement.",
    deliverables: ["Onboarding Checklist", "Activation Telemetry Events", "NPS / Feedback Loop"],
    validationGate: "Users achieve the 'Aha!' moment in under 3 minutes from first login.",
  },
] as const

const JARGON_WORDS = [
  "synergy",
  "disruptive",
  "game-changer",
  "next-gen",
  "unprecedented",
  "revolutionary",
  "cutting-edge",
  "holistic",
  "paradigm shift",
  "best-of-breed",
]

export class GtmGrowthEngine {
  public static getPlaybook(): readonly GtmSprintMilestone[] {
    return GTM_PLAYBOOK_PHASES
  }

  /**
   * Audits marketing copy (landing pages, emails, pitch decks) for clarity, CTA friction, and buzzword pollution.
   */
  public auditMarketingCopy(copyText: string): CroAuditReport {
    const lower = copyText.toLowerCase()
    const recommendations: string[] = []

    // 1. Jargon check
    let jargonPenalty = 0
    for (const word of JARGON_WORDS) {
      if (lower.includes(word)) {
        jargonPenalty += 10
        recommendations.push(`Remove buzzword '${word}' and replace with specific, measurable benefits.`)
      }
    }
    jargonPenalty = Math.min(jargonPenalty, 50)

    // 2. Value Proposition Clarity
    let clarityScore = 80
    if (copyText.length < 50) {
      clarityScore -= 30
      recommendations.push("Copy is too brief to convey meaningful value; expand on the user's transformation.")
    }
    if (lower.includes("all-in-one") || lower.includes("everything you need")) {
      clarityScore -= 15
      recommendations.push("Avoid generic 'all-in-one' claims; specify the exact primary problem solved.")
    }

    // 3. CTA Actionability
    let ctaScore = 50
    const strongCtas = ["start free", "try", "get started", "book demo", "install", "download"]
    for (const cta of strongCtas) {
      if (lower.includes(cta)) {
        ctaScore = 90
        break
      }
    }
    if (ctaScore < 70) {
      recommendations.push("Add a clear, low-friction Call to Action (e.g. 'Start Free Trial' or 'Install Extension').")
    }

    const netScore = Math.max(0, clarityScore + ctaScore - jargonPenalty) / 2
    let overallRating: CroAuditReport["overallRating"] = "EXCELLENT"
    if (netScore < 50) overallRating = "POOR"
    else if (netScore < 70) overallRating = "NEEDS_IMPROVEMENT"
    else if (netScore < 85) overallRating = "GOOD"

    return {
      clarityScore,
      ctaScore,
      jargonPenalty,
      overallRating,
      recommendations,
    }
  }

  /**
   * Generates a 3-touch hyper-personalized outbound email sequence for a product.
   */
  public generateOutboundSequence(productName: string, targetPersona: string, coreBenefit: string) {
    return [
      {
        touchNumber: 1,
        timing: "Day 1",
        subject: `Quick question regarding ${targetPersona} workflow`,
        body: `Hi {{firstName}},\n\nNoticed you're leading ${targetPersona} initiatives at {{company}}. Most teams we speak with struggle with ${coreBenefit.toLowerCase()}.\n\nWe built ${productName} to solve this directly. Worth a 3-minute glance?\n\nBest,\nTeam ${productName}`,
      },
      {
        touchNumber: 2,
        timing: "Day 4",
        subject: `Resource for {{company}}: ${coreBenefit}`,
        body: `Hi {{firstName}},\n\nWanted to share a quick teardown of how engineering teams are solving ${coreBenefit.toLowerCase()} without cloud token bloat.\n\nHere is a 60-second preview: {{link}}.\n\nBest,\nTeam ${productName}`,
      },
      {
        touchNumber: 3,
        timing: "Day 8",
        subject: `Closing the loop on ${productName}`,
        body: `Hi {{firstName}},\n\nAssume ${coreBenefit.toLowerCase()} is either handled or not a priority right now. Either way, no worries at all.\n\nIf you ever want to test local-first offline execution, here's our documentation: {{docsLink}}.\n\nCheers,\nTeam ${productName}`,
      },
    ]
  }
}
