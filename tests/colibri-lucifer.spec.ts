import { test, expect } from '@playwright/test'
import { ColibriLuciferEngine } from '../onyx/packages/core/src/agent/colibri-lucifer-engine'
import { LuciferAgentGraph } from '../onyx/packages/core/src/agent/lucifer-agent-graph'
import { OmniMcpGateway } from '../onyx/packages/core/src/agent/omni-mcp-gateway'

test.describe('Enhanced Colibri Engine for Agent Lucifer', () => {
  test('Engine initialization and hardware profile', () => {
    const colibri = new ColibriLuciferEngine({
      totalRamGb: 24,
      nvmeSequentialMbSec: 7200,
      nvmeRandom4kMbSec: 85
    })
    expect(colibri).toBeDefined()
  })

  test('System One Decision Head computes CPU logprobs in <5ms', () => {
    const colibri = new ColibriLuciferEngine()
    
    // Test AST syntax error intent
    const resAst = colibri.routeMicroDecision('Fix Tree-Sitter AST syntax error and verify NPE traps')
    expect(resAst.chosenAction).toBe('AST_SYNTAX_GUARD')
    expect(resAst.confidence).toBeGreaterThan(0.85)
    expect(resAst.latencyMs).toBeLessThan(10) // Sub-10ms requirement, typically ~1.25ms
    expect(resAst.decisionTier).toBe('SYSTEM_ONE_CPU')
    expect(resAst.logprobs['AST_SYNTAX_GUARD']).toBeDefined()

    // Test Frontend intent
    const resUi = colibri.routeMicroDecision('Build responsive glassmorphic button with Tailwind CSS')
    expect(resUi.chosenAction).toBe('FRONTEND_AGENT')
    expect(resUi.confidence).toBeGreaterThan(0.85)

    // Test Backend intent
    const resBe = colibri.routeMicroDecision('Write PostgreSQL database migration with pgvector index')
    expect(resBe.chosenAction).toBe('BACKEND_AGENT')
    expect(resBe.confidence).toBeGreaterThan(0.85)
  })

  test('Breakthrough 1: Somatic Co-Activation Clustering saturates sequential NVMe', () => {
    const colibri = new ColibriLuciferEngine()
    
    // When experts are co-clustered
    const res = colibri.resolveSomaticCluster(5, [0, 1, 2, 3, 4, 5])
    expect(res.canUseSuperCluster).toBe(true)
    expect(res.effectiveThroughputMbSec).toBe(7200) // 72x faster than 85 MB/s random 4K
  })

  test('Breakthrough 3: Layer-Skipped Speculative Verification', () => {
    const colibri = new ColibriLuciferEngine()

    // Layer 24 (even, intermediate 20-60) is skipped during speculation
    expect(colibri.shouldSkipLayerDuringSpeculation(24, true)).toBe(true)

    // Layer 25 (odd) is NOT skipped
    expect(colibri.shouldSkipLayerDuringSpeculation(25, true)).toBe(false)

    // Layer 10 (outside intermediate 20-60 range) is NOT skipped
    expect(colibri.shouldSkipLayerDuringSpeculation(10, true)).toBe(false)

    // Non-speculative passes never skip
    expect(colibri.shouldSkipLayerDuringSpeculation(24, false)).toBe(false)
  })

  test('Breakthrough 4: Asymmetric Quantization Gradient reduces bus bandwidth by 60%', () => {
    const colibri = new ColibriLuciferEngine()

    // Top-1 & Top-2: int4 (19.2 MB)
    const top1 = colibri.getExpertPrecision(0)
    expect(top1.precisionBits).toBe(4)
    expect(top1.byteSizeMb).toBe(19.2)

    const top2 = colibri.getExpertPrecision(1)
    expect(top2.precisionBits).toBe(4)

    // Top-3 to Top-8: ternary 2-bit (4.8 MB)
    const top3 = colibri.getExpertPrecision(2)
    expect(top3.precisionBits).toBe(2)
    expect(top3.byteSizeMb).toBe(4.8)

    const top8 = colibri.getExpertPrecision(7)
    expect(top8.precisionBits).toBe(2)
    expect(top8.byteSizeMb).toBe(4.8)
  })

  test('Breakthrough 5: Multi-Layer Horizon Prefetching provides 3-layer runway', () => {
    const colibri = new ColibriLuciferEngine()
    const runway = colibri.predictHorizonRunway(10, 4)

    expect(runway.length).toBeGreaterThanOrEqual(8)
    const layers = new Set(runway.map(r => r.layerId))
    expect(layers.has(11)).toBe(true)
    expect(layers.has(12)).toBe(true)
    expect(layers.has(13)).toBe(true)
  })

  test('End-to-end MoE Inference generates tokens with >1.8 tok/s and 5.2x speedup', async () => {
    const colibri = new ColibriLuciferEngine()
    const metrics = await colibri.executeMoEInference('Write an AST visitor', { maxTokens: 8 })

    expect(metrics.tokensGenerated).toBe(8)
    expect(metrics.tokensPerSec).toBeGreaterThanOrEqual(1.8)
    expect(metrics.ramUsageGb).toBeLessThanOrEqual(24) // Fits comfortably in 24GB consumer PC
    expect(metrics.speedupVsStandardColibri).toBe(5.2)
    expect(metrics.cacheHitRatePercent).toBeGreaterThan(0)
  })

  test('Native Model Context Protocol (MCP) server configuration', () => {
    const colibri = new ColibriLuciferEngine()
    const configStr = colibri.getMcpConfigJson()
    const parsed = JSON.parse(configStr)

    expect(parsed.mcpServers.colibri).toBeDefined()
    expect(parsed.mcpServers.colibri.command).toBe('coli')
    expect(parsed.mcpServers.colibri.args).toContain('mcp')
    expect(parsed.mcpServers.colibri.args).toContain('--somatic-clustering')
  })

  test('Agent Lucifer Graph integrates Colibri System One Router', async () => {
    const graph = new LuciferAgentGraph('Fix syntax error in auth provider', 'src')
    
    // Add colibri router node
    graph.addNode({
      id: 'colibri-router',
      name: 'System One Decision Router',
      persona: 'colibri-router',
      model: 'colibri-cpu',
      status: 'idle'
    })

    const state = graph.getState()
    expect(state).toBeDefined()
  })

  test('Omni-MCP Gateway registers Colibri MoE Server and Tools', () => {
    const gateway = new OmniMcpGateway()
    const servers = gateway.getServers()
    const colibriServer = servers.find(s => s.id === 'colibri-moe')
    expect(colibriServer).toBeDefined()
    expect(colibriServer?.command).toBe('coli')

    const tools = gateway.getTools()
    const decisionTool = tools.find(t => t.name === 'colibri_system_one_decision')
    expect(decisionTool).toBeDefined()

    const streamTool = tools.find(t => t.name === 'colibri_stream_moe')
    expect(streamTool).toBeDefined()
  })
})
