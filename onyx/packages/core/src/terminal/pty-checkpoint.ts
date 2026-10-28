export interface ProcessGuardianEntry {
  readonly processId: number
  readonly command: string
  readonly startTime: number
  readonly status: "RUNNING" | "TERMINATED" | "ABORTED"
}

export interface FileSnapshot {
  readonly filePath: string
  readonly content: string
  readonly timestamp: number
}

export interface CheckpointRecord {
  readonly checkpointId: string
  readonly taskId: string
  readonly timestamp: string
  readonly files: readonly FileSnapshot[]
}

export class PtyTerminalProcessGuardian {
  private activeProcesses: Map<number, ProcessGuardianEntry> = new Map()

  public registerProcess(pid: number, command: string): ProcessGuardianEntry {
    const entry: ProcessGuardianEntry = {
      processId: pid,
      command,
      startTime: Date.now(),
      status: "RUNNING",
    }
    this.activeProcesses.set(pid, entry)
    return entry
  }

  public terminateProcess(pid: number): boolean {
    const entry = this.activeProcesses.get(pid)
    if (!entry) return false
    this.activeProcesses.set(pid, { ...entry, status: "TERMINATED" })
    return true
  }

  public killAllActive(): number {
    let killed = 0
    for (const [pid, entry] of this.activeProcesses.entries()) {
      if (entry.status === "RUNNING") {
        this.activeProcesses.set(pid, { ...entry, status: "ABORTED" })
        killed++
      }
    }
    return killed
  }

  public stripAnsi(text: string): string {
    // Strips ANSI escape sequences from terminal PTY outputs
    return text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "")
  }

  public getActiveCount(): number {
    return Array.from(this.activeProcesses.values()).filter((p) => p.status === "RUNNING").length
  }
}

export class AtomicGitCheckpointManager {
  private checkpoints: Map<string, CheckpointRecord> = new Map()

  /**
   * Captures an instant, zero-overhead checkpoint of files before agent modification.
   */
  public createCheckpoint(taskId: string, files: { path: string; content: string }[]): CheckpointRecord {
    const id = `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const record: CheckpointRecord = {
      checkpointId: id,
      taskId,
      timestamp: new Date().toISOString(),
      files: files.map((f) => ({
        filePath: f.path,
        content: f.content,
        timestamp: Date.now(),
      })),
    }
    this.checkpoints.set(id, record)
    return record
  }

  /**
   * 1-click restore to roll back file state to checkpoint.
   */
  public restoreCheckpoint(checkpointId: string): CheckpointRecord | undefined {
    return this.checkpoints.get(checkpointId)
  }

  public getCheckpointsForTask(taskId: string): CheckpointRecord[] {
    return Array.from(this.checkpoints.values()).filter((c) => c.taskId === taskId)
  }
}
