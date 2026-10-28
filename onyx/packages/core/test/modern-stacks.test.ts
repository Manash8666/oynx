import { describe, expect, test } from "bun:test"
import { ModernTechStackRegistry } from "../src/stacks/modern-stacks"

describe("Modern Tech Stacks Integration in Onyx", () => {
  test("should register all 10 modern 2026 tech stacks", () => {
    const stacks = ModernTechStackRegistry.getAllModernStacks()
    expect(stacks.length).toBe(10)

    const ids = stacks.map((s) => s.id)
    expect(ids).toContain("nextjs-app-router")
    expect(ids).toContain("svelte5-runes")
    expect(ids).toContain("astro-islands")
    expect(ids).toContain("bun-hono-edge")
    expect(ids).toContain("ai-llm-engineering")
    expect(ids).toContain("flutter-dart")
    expect(ids).toContain("react-native-expo")
    expect(ids).toContain("tauri-v2-rust")
    expect(ids).toContain("web3-solidity-foundry")
    expect(ids).toContain("solidjs-signals")
  })

  test("should identify modern stacks by extensions (e.g. .astro, .dart, .sol, .svelte)", () => {
    // Astro
    const astro = ModernTechStackRegistry.getByExtension(".astro")
    expect(astro?.id).toBe("astro-islands")
    expect(astro?.buildCommand).toContain("astro build")

    // Svelte 5
    const svelte = ModernTechStackRegistry.getByExtension(".svelte")
    expect(svelte?.id).toBe("svelte5-runes")
    expect(svelte?.defaultLspServer).toBe("svelte-language-server")

    // Flutter / Dart
    const dart = ModernTechStackRegistry.getByExtension(".dart")
    expect(dart?.id).toBe("flutter-dart")
    expect(dart?.testCommand).toBe("flutter test")

    // Solidity
    const sol = ModernTechStackRegistry.getByExtension(".sol")
    expect(sol?.id).toBe("web3-solidity-foundry")
    expect(sol?.testCommand).toBe("forge test")
  })

  test("should categorize stacks into Edge, Mobile, AI, Desktop, and Web3", () => {
    const aiStacks = ModernTechStackRegistry.getByCategory("AI_ENGINEERING")
    expect(aiStacks.length).toBeGreaterThanOrEqual(1)
    expect(aiStacks[0].primaryFrameworks).toContain("LangGraph")

    const mobileStacks = ModernTechStackRegistry.getByCategory("MOBILE_CROSSPLATFORM")
    expect(mobileStacks.length).toBe(2) // Flutter + React Native Expo
  })
})
