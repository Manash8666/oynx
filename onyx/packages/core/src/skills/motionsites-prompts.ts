export interface MotionSiteColorSystem {
  readonly background: string
  readonly foreground: string
  readonly primary: string
  readonly primaryForeground: string
  readonly secondary: string
  readonly muted: string
  readonly mutedForeground: string
  readonly border: string
  readonly card: string
}

export interface MotionSiteTemplate {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly description: string
  readonly colorSystem: MotionSiteColorSystem
  readonly layoutStructure: readonly string[]
  readonly keyEffects: readonly string[]
}

export const MOTIONSITE_TEMPLATES: readonly MotionSiteTemplate[] = [
  {
    id: "apex-saas",
    name: "Apex SaaS",
    category: "saas-landing",
    description: "Dark, cinematic SaaS landing with glassmorphism, floating navigation, and social proof.",
    colorSystem: {
      background: "260 87% 3%",
      foreground: "40 6% 95%",
      primary: "262 83% 58%",
      primaryForeground: "0 0% 100%",
      secondary: "240 4% 16%",
      muted: "240 4% 16%",
      mutedForeground: "240 5% 65%",
      border: "240 4% 20%",
      card: "240 6% 9%",
    },
    layoutStructure: [
      "Floating glassmorphic navbar with CTA",
      "Cinematic hero with kinetic typography and backdrop blur",
      "Interactive feature bento grid with gradient card borders",
      "Dynamic metrics and social proof ticker",
      "Conversion footer with subtle ambient glow",
    ],
    keyEffects: [
      "liquid-glass: backdrop-filter blur(12px) with 1px luminosity border",
      "ambient-glow: radial-gradient behind active headline",
      "subtle-card-tilt: interactive perspective on hover",
    ],
  },
  {
    id: "ai-designer-portfolio",
    name: "AI Designer Portfolio",
    category: "portfolio",
    description: "Minimalist, high-end agency and developer portfolio with dynamic case study reveals.",
    colorSystem: {
      background: "220 20% 4%",
      foreground: "210 20% 98%",
      primary: "187 90% 55%",
      primaryForeground: "220 20% 4%",
      secondary: "220 15% 12%",
      muted: "220 15% 15%",
      mutedForeground: "220 10% 60%",
      border: "220 15% 18%",
      card: "220 18% 7%",
    },
    layoutStructure: [
      "Sticky navigation with sound toggle and status badge",
      "Oversized editorial hero with cursor-reactive accents",
      "Horizontal project gallery with smooth snap scrolling",
      "Skills and technology matrix with animated pills",
      "Direct contact drawer",
    ],
    keyEffects: [
      "editorial-contrast: ultra-refined font weights (300 vs 700)",
      "smooth-reveal: intersection-observer fade-up transforms",
      "glass-pill: rounded-full tags with translucent border",
    ],
  },
  {
    id: "akor-security",
    name: "AKOR Security Cloud",
    category: "security-cloud",
    description: "Enterprise cyber-defense and cloud security interface with live threat telemetry.",
    colorSystem: {
      background: "222 47% 4%",
      foreground: "210 40% 98%",
      primary: "142 71% 45%",
      primaryForeground: "222 47% 4%",
      secondary: "217 33% 14%",
      muted: "217 33% 14%",
      mutedForeground: "215 20% 65%",
      border: "217 33% 17%",
      card: "222 47% 8%",
    },
    layoutStructure: [
      "SOC-style header with live telemetry indicator",
      "Hero with animated node graph and zero-trust headline",
      "Multi-tab architecture inspector (Cloud, Edge, Gateway)",
      "Compliance audit checklist and SOC2/ISO badges",
      "Enterprise quote calculator and sandbox launch button",
    ],
    keyEffects: [
      "terminal-accent: monospace data tags with emerald glow",
      "grid-background: 1px subtle coordinate grid overlay",
      "threat-radar: pulsing concentric SVG radar animation",
    ],
  },
  {
    id: "bloom-ai",
    name: "Bloom AI Platform",
    category: "ai-agent-showcase",
    description: "Agentic workflow and multi-model orchestration showcase with prompt playground.",
    colorSystem: {
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      primary: "263 70% 50%",
      primaryForeground: "0 0% 100%",
      secondary: "240 3.7% 15.9%",
      muted: "240 3.7% 15.9%",
      mutedForeground: "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      card: "240 10% 6%",
    },
    layoutStructure: [
      "Brand navigation with model selector preview",
      "Interactive prompt terminal hero with real-time streaming preview",
      "Multi-agent workflow diagram (Planner, Coder, Reviewer)",
      "Latency and benchmark comparison graphs",
      "Developer documentation and SDK quickstart tab",
    ],
    keyEffects: [
      "streaming-cursor: blinking prompt cursor with token highlight",
      "model-glow: adaptive colored shadows based on selected model",
      "bento-orchestration: cards connecting via animated SVG lines",
    ],
  },
  {
    id: "aethera-studio",
    name: "Aethera Creative Studio",
    category: "creative-studio",
    description: "Award-winning cinematic landing for next-generation generative creative studios.",
    colorSystem: {
      background: "0 0% 2%",
      foreground: "0 0% 96%",
      primary: "36 100% 50%",
      primaryForeground: "0 0% 2%",
      secondary: "0 0% 12%",
      muted: "0 0% 12%",
      mutedForeground: "0 0% 60%",
      border: "0 0% 18%",
      card: "0 0% 6%",
    },
    layoutStructure: [
      "Full-bleed cinematic video canvas hero",
      "Studio manifesto with giant typography",
      "Interactive audio-visual experiment cards",
      "Client reel and awards showcase",
      "Collaborative project inquiry form",
    ],
    keyEffects: [
      "liquid-glass: deep blur with refraction rim highlight",
      "grain-overlay: subtle film noise texture",
      "magnetic-buttons: buttons with spring physics",
    ],
  },
] as const

export const MOTIONSITE_CATEGORIES = [
  "saas-landing",
  "portfolio",
  "ai-agent-showcase",
  "security-cloud",
  "creative-studio",
] as const

