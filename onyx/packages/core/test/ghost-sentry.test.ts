import { describe, expect, test } from "bun:test"
import { GhostSentryDaemon } from "../src/agent/ghost-sentry"

describe("Ghost Mode Autonomous Sentry Daemon (Upgrade 9)", () => {
  const sentry = new GhostSentryDaemon()

  test("should enqueue backlog issues and pause processing during non-idle active work", async () => {
    sentry.enqueueIssue({
      id: "SEC-901",
      title: "Hardcoded secret key in config.ts",
      priority: "P0",
      type: "SECURITY_CVE",
      affectedFile: "src/config.ts",
    })

    const activeReport = await sentry.tickBackgroundSprint(false)
    expect(activeReport.isIdle).toBe(false)
    expect(activeReport.resolvedPRs.length).toBe(0)
  })

  test("should resolve queued issues and draft PRs with tests during idle background sprint", async () => {
    const idleReport = await sentry.tickBackgroundSprint(true)
    expect(idleReport.isIdle).toBe(true)
    expect(idleReport.resolvedPRs.length).toBe(1)

    const pr = idleReport.resolvedPRs[0]
    expect(pr.title).toContain("[Ghost Fix]")
    expect(pr.branchName).toContain("ghost/fix-sec-901")
    expect(pr.testsCreated).toBe(2)
    expect(pr.status).toBe("READY_FOR_REVIEW")
  })
})
