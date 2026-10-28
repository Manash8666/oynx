export interface ModernTechStackDefinition {
  readonly id: string
  readonly name: string
  readonly category: "EDGE_FULLSTACK" | "MOBILE_CROSSPLATFORM" | "AI_ENGINEERING" | "LIGHTWEIGHT_DESKTOP" | "WEB3_SMART_CONTRACTS"
  readonly primaryLanguages: readonly string[]
  readonly fileExtensions: readonly string[]
  readonly packageManagers: readonly string[]
  readonly primaryFrameworks: readonly string[]
  readonly defaultLspServer: string
  readonly devCommand: string
  readonly buildCommand: string
  readonly testCommand: string
  readonly hasTreeSitterSupport: boolean
  readonly commercialReadiness: "PRODUCTION_READY" | "BETA"
}

export const MODERN_TECH_STACKS: readonly ModernTechStackDefinition[] = [
  // 1. Next.js 15+ App Router & React 19
  {
    id: "nextjs-app-router",
    name: "Next.js 15+ App Router (React 19 & RSC)",
    category: "EDGE_FULLSTACK",
    primaryLanguages: ["TypeScript", "TSX"],
    fileExtensions: [".tsx", ".ts", ".jsx", ".js"],
    packageManagers: ["bun", "pnpm", "npm"],
    primaryFrameworks: ["Next.js 15", "React 19", "Tailwind CSS v4", "Server Actions"],
    defaultLspServer: "typescript-language-server",
    devCommand: "bun run dev",
    buildCommand: "bun run build",
    testCommand: "bun test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 2. Svelte 5 / SvelteKit (Runes)
  {
    id: "svelte5-runes",
    name: "Svelte 5 & SvelteKit (Runes Reactivity)",
    category: "EDGE_FULLSTACK",
    primaryLanguages: ["Svelte", "TypeScript"],
    fileExtensions: [".svelte", ".ts"],
    packageManagers: ["bun", "pnpm"],
    primaryFrameworks: ["Svelte 5", "SvelteKit", "Vite", "Tailwind CSS"],
    defaultLspServer: "svelte-language-server",
    devCommand: "bun run dev",
    buildCommand: "bun run build",
    testCommand: "vitest run",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 3. Astro 5+ Islands Architecture
  {
    id: "astro-islands",
    name: "Astro 5+ (Zero-JS Islands & Content Collections)",
    category: "EDGE_FULLSTACK",
    primaryLanguages: ["Astro", "TypeScript"],
    fileExtensions: [".astro", ".ts", ".mdx"],
    packageManagers: ["bun", "pnpm"],
    primaryFrameworks: ["Astro 5", "Tailwind CSS", "MDX"],
    defaultLspServer: "astro-ls",
    devCommand: "bunx astro dev",
    buildCommand: "bunx astro build",
    testCommand: "bunx astro check",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 4. Bun & Hono Modern Edge APIs
  {
    id: "bun-hono-edge",
    name: "Bun & Hono Ultra-Fast Edge APIs",
    category: "EDGE_FULLSTACK",
    primaryLanguages: ["TypeScript"],
    fileExtensions: [".ts"],
    packageManagers: ["bun"],
    primaryFrameworks: ["Hono", "Bun.serve", "Zod", "Drizzle ORM"],
    defaultLspServer: "typescript-language-server",
    devCommand: "bun run --watch src/index.ts",
    buildCommand: "bun build ./src/index.ts --outdir ./dist",
    testCommand: "bun test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 5. AI / LLM Engineering (PyTorch, Transformers, LangGraph, Vercel AI SDK)
  {
    id: "ai-llm-engineering",
    name: "AI & Agentic Systems (PyTorch / LangGraph / Vercel AI)",
    category: "AI_ENGINEERING",
    primaryLanguages: ["Python", "TypeScript"],
    fileExtensions: [".py", ".ts", ".ipynb"],
    packageManagers: ["uv", "poetry", "bun"],
    primaryFrameworks: ["PyTorch", "HuggingFace", "LangGraph", "Vercel AI SDK", "LlamaIndex", "Ollama"],
    defaultLspServer: "pyright",
    devCommand: "uv run python main.py",
    buildCommand: "uv sync",
    testCommand: "pytest",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 6. Flutter & Dart Cross-Platform
  {
    id: "flutter-dart",
    name: "Flutter & Dart Multi-Platform (iOS, Android, Desktop)",
    category: "MOBILE_CROSSPLATFORM",
    primaryLanguages: ["Dart"],
    fileExtensions: [".dart", ".yaml"],
    packageManagers: ["flutter pub"],
    primaryFrameworks: ["Flutter 3", "Riverpod", "Bloc"],
    defaultLspServer: "dart-analysis-server",
    devCommand: "flutter run",
    buildCommand: "flutter build bundle",
    testCommand: "flutter test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 7. React Native & Expo (Hermes)
  {
    id: "react-native-expo",
    name: "React Native & Expo (Hermes Engine)",
    category: "MOBILE_CROSSPLATFORM",
    primaryLanguages: ["TypeScript", "TSX"],
    fileExtensions: [".tsx", ".ts"],
    packageManagers: ["bun", "pnpm", "npx"],
    primaryFrameworks: ["Expo 52", "React Native", "Expo Router", "NativeWind"],
    defaultLspServer: "typescript-language-server",
    devCommand: "npx expo start",
    buildCommand: "npx expo export",
    testCommand: "bun test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 8. Tauri v2 Lightweight Desktop Systems
  {
    id: "tauri-v2-rust",
    name: "Tauri v2 (Rust Systems + Web Frontend)",
    category: "LIGHTWEIGHT_DESKTOP",
    primaryLanguages: ["Rust", "TypeScript"],
    fileExtensions: [".rs", ".tsx", ".toml"],
    packageManagers: ["cargo", "bun"],
    primaryFrameworks: ["Tauri 2", "SolidJS", "React", "Tokio"],
    defaultLspServer: "rust-analyzer",
    devCommand: "cargo tauri dev",
    buildCommand: "cargo tauri build",
    testCommand: "cargo test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 9. Web3 & Smart Contracts (Foundry / Solidity)
  {
    id: "web3-solidity-foundry",
    name: "Web3 Smart Contracts (Solidity & Foundry)",
    category: "WEB3_SMART_CONTRACTS",
    primaryLanguages: ["Solidity"],
    fileExtensions: [".sol"],
    packageManagers: ["forge", "npm"],
    primaryFrameworks: ["Foundry", "OpenZeppelin", "Hardhat", "Viem"],
    defaultLspServer: "nomicfoundation-solidity-ls",
    devCommand: "forge build --watch",
    buildCommand: "forge build",
    testCommand: "forge test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },

  // 10. SolidJS 1.9 & SolidStart (Reactive Signals)
  {
    id: "solidjs-signals",
    name: "SolidJS 1.9 & SolidStart (Fine-Grained Reactivity)",
    category: "EDGE_FULLSTACK",
    primaryLanguages: ["TypeScript", "TSX"],
    fileExtensions: [".tsx", ".ts"],
    packageManagers: ["bun", "pnpm"],
    primaryFrameworks: ["SolidJS 1.9", "SolidStart", "Tailwind CSS v4"],
    defaultLspServer: "typescript-language-server",
    devCommand: "bun run dev",
    buildCommand: "bun run build",
    testCommand: "bun test",
    hasTreeSitterSupport: true,
    commercialReadiness: "PRODUCTION_READY",
  },
] as const

export class ModernTechStackRegistry {
  public static getAllModernStacks(): readonly ModernTechStackDefinition[] {
    return MODERN_TECH_STACKS
  }

  public static getByExtension(ext: string): ModernTechStackDefinition | undefined {
    const formatted = ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`
    return MODERN_TECH_STACKS.find((stack) =>
      stack.fileExtensions.some((e) => e.toLowerCase() === formatted)
    )
  }

  public static getById(id: string): ModernTechStackDefinition | undefined {
    return MODERN_TECH_STACKS.find((s) => s.id === id)
  }

  public static getByCategory(category: ModernTechStackDefinition["category"]): ModernTechStackDefinition[] {
    return MODERN_TECH_STACKS.filter((s) => s.category === category)
  }
}
