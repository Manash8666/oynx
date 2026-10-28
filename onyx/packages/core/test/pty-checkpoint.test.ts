import { describe, expect, test } from "bun:test"
import { PtyTerminalProcessGuardian, AtomicGitCheckpointManager } from "../src/terminal/pty-checkpoint"

describe("Pillar 2: PTY Process Guardian & Atomic Checkpoints (Claude Code Inspired)", () => {
  const guardian = new PtyTerminalProcessGuardian()
  const checkpointMgr = new AtomicGitCheckpointManager()

  test("should register child processes and kill all active during abort/cancellation", () => {
    guardian.registerProcess(101, "bun run build")
    guardian.registerProcess(102, "tsc --watch")

    expect(guardian.getActiveCount()).toBe(2)

    const killed = guardian.killAllActive()
    expect(killed).toBe(2)
    expect(guardian.getActiveCount()).toBe(0)
  })

  test("should strip ANSI escape sequences from terminal logs", () => {
    const rawAnsi = "\u001b[32m✔ Build Succeeded\u001b[0m in 14ms"
    const clean = guardian.stripAnsi(rawAnsi)
    expect(clean).toBe("✔ Build Succeeded in 14ms")
  })

  test("should create and restore atomic snapshots for 1-click agent rollback", () => {
    const originalCode = `const version = "1.0.0";`
    const checkpoint = checkpointMgr.createCheckpoint("task-auth", [
      { path: "src/version.ts", content: originalCode },
    ])

    expect(checkpoint.checkpointId).toContain("chk-")
    expect(checkpoint.files[0].content).toBe(originalCode)

    // Restore verification
    const restored = checkpointMgr.restoreCheckpoint(checkpoint.checkpointId)
    expect(restored).toBeDefined()
    expect(restored?.files[0].content).toBe(originalCode)
  })
})
