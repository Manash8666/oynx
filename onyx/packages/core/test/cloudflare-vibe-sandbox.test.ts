import { describe, expect, test } from "bun:test"
import { CloudflareVibeSandbox } from "../src/sandbox/cloudflare-vibe-sandbox"

describe("Cloudflare Vibe Sandbox & Gateway (Clean-Room VibeSDK)", () => {
  const sandbox = new CloudflareVibeSandbox({
    accountId: "test-account",
    gatewayName: "onyx-gateway",
  })

  test("should format Cloudflare AI Gateway URL with caching rules", () => {
    const route = sandbox.getGatewayRoute("openai", "gpt-4o")
    expect(route.gatewayUrl).toBe("https://gateway.ai.cloudflare.com/v1/test-account/onyx-gateway/openai")
    expect(route.cacheTtlSeconds).toBe(3600)
    expect(route.provider).toBe("openai")
  })

  test("should execute valid code within sandboxed worker environment", async () => {
    const result = await sandbox.executeSandboxed("const x = 10; const y = 20; return x + y;")
    expect(result.exitCode).toBe(0)
    expect(result.isSandboxed).toBe(true)
    expect(result.stdout).toContain("isolated worker runtime")
  })

  test("should catch syntax errors cleanly without throwing unhandled exceptions", async () => {
    const result = await sandbox.executeSandboxed("const invalid syntax = ;")
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toBeDefined()
  })

  test("should package HTML into a standalone Cloudflare Worker preview module", () => {
    const workerCode = sandbox.packageWorkerArtifact("<h1>Onyx Artifact</h1>")
    expect(workerCode).toContain("export default")
    expect(workerCode).toContain("Content-Security-Policy")
    expect(workerCode).toContain("Onyx Artifact")
  })
})
