import { describe, expect, test } from "bun:test"
import { AutonomousAgentSwarmCoordinator } from "../src/agent/agent-swarm"

describe("Autonomous Multi-Agent Swarm Coordinator (Upgrade 6)", () => {
  const coordinator = new AutonomousAgentSwarmCoordinator()

  test("should decompose feature request into a multi-role parallel task DAG", () => {
    const plan = coordinator.planFeature("OAuth2 Authentication Flow", "Full-stack OAuth with JWT and UI button")
    expect(plan.nodes.length).toBe(5)
    expect(plan.estimatedParallelism).toBe(2)

    const roles = plan.nodes.map((n) => n.role)
    expect(roles).toContain("ARCHITECT")
    expect(roles).toContain("CODER")
    expect(roles).toContain("QA_ENGINEER")
    expect(roles).toContain("SYNTHESIZER")
  })

  test("should execute parallel worktree tasks concurrently and synthesize clean report", async () => {
    const plan = coordinator.planFeature("Real-time Chat", "WebSocket chat with message queue")
    const report = await coordinator.executeSwarm(plan)

    expect(report.status).toBe("SUCCESS")
    expect(report.completedTasks).toBe(5)
    expect(report.totalTestsRun).toBeGreaterThan(0)
    expect(report.synthesizedDiffCount).toBeGreaterThanOrEqual(3)
    expect(report.logs.some((l) => l.includes("Synthesizer"))).toBe(true)
  })
})
