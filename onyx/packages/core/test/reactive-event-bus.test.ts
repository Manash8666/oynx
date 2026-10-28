import { describe, expect, test } from "bun:test"
import { ReactiveEventBus, ContextIsolatedSubagentManager } from "../src/agent/reactive-event-bus"

describe("Pillar 3: Reactive Event-Driven Bus & Context Isolation (Antigravity Inspired)", () => {
  const bus = new ReactiveEventBus()
  const subagentMgr = new ContextIsolatedSubagentManager()

  test("should wake up reactively when an event fires without polling", async () => {
    const promise = bus.waitForEvent("TESTS_COMPLETED", 1000)

    // Simulate background test finish after 50ms
    setTimeout(() => {
      bus.emit("TESTS_COMPLETED", { passed: 12, failed: 0 })
    }, 50)

    const event = await promise
    expect(event.type).toBe("TESTS_COMPLETED")
    expect(event.payload.passed).toBe(12)
  })

  test("should time out if expected event does not arrive within limit", async () => {
    expect(bus.waitForEvent("HEALING_REQUIRED", 100)).rejects.toThrow("Timeout")
  })

  test("should isolate subagent context and prevent parent context pollution", () => {
    const scope = subagentMgr.createIsolatedScope("QA_ENGINEER", "parent-conv-123", 1000)
    expect(scope.subagentId).toContain("sub-qa_engineer")

    const accepted = subagentMgr.appendMessage(scope.subagentId, "Executed 5 fuzz tests against auth endpoint")
    expect(accepted).toBe(true)
    expect(scope.tokensUsed).toBeGreaterThan(0)

    const summaryArtifact = subagentMgr.synthesizeArtifact(scope.subagentId)
    expect(summaryArtifact).toContain("[Subagent: QA_ENGINEER]")
    expect(summaryArtifact).toContain("Executed 5 fuzz tests")
  })
})
