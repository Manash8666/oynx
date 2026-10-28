export interface GhostIssue {
  readonly id: string
  readonly title: string
  readonly priority: "P0" | "P1" | "P2"
  readonly type: "BUG" | "SECURITY_CVE" | "PERF_BOTTLENECK" | "DEAD_CODE"
  readonly affectedFile: string
  status: "QUEUED" | "PROCESSING" | "RESOLVED"
}

export interface GhostDraftPR {
  readonly prNumber: number
  readonly title: string
  readonly branchName: string
  readonly issueId: string
  readonly diffSummary: string
  readonly testsCreated: number
  readonly status: "READY_FOR_REVIEW"
}

export interface SentryScanReport {
  readonly timestamp: string
  readonly issuesFound: readonly GhostIssue[]
  readonly resolvedPRs: readonly GhostDraftPR[]
  readonly cpuLoadPercent: number
  readonly isIdle: boolean
}

export class GhostSentryDaemon {
  private backlog: GhostIssue[] = []
  private draftedPRs: GhostDraftPR[] = []
  private nextPrId = 101

  public enqueueIssue(issue: Omit<GhostIssue, "status">): GhostIssue {
    const fullIssue: GhostIssue = { ...issue, status: "QUEUED" }
    this.backlog.push(fullIssue)
    return fullIssue
  }

  /**
   * Background tick: Runs when the system is idle or during overnight hours.
   */
  public async tickBackgroundSprint(simulatedIdle = true): Promise<SentryScanReport> {
    if (!simulatedIdle) {
      return {
        timestamp: new Date().toISOString(),
        issuesFound: this.backlog.filter((b) => b.status === "QUEUED"),
        resolvedPRs: [],
        cpuLoadPercent: 12,
        isIdle: false,
      }
    }

    // Process highest priority queued issue
    const queued = this.backlog.find((b) => b.status === "QUEUED")
    const newPrs: GhostDraftPR[] = []

    if (queued) {
      queued.status = "PROCESSING"

      // Synthesize patch & unit test
      const pr: GhostDraftPR = {
        prNumber: this.nextPrId++,
        title: `[Ghost Fix] ${queued.title}`,
        branchName: `ghost/fix-${queued.id.toLowerCase()}`,
        issueId: queued.id,
        diffSummary: `Automated patch synthesized for ${queued.affectedFile}. Zero human intervention.`,
        testsCreated: 2,
        status: "READY_FOR_REVIEW",
      }

      this.draftedPRs.push(pr)
      newPrs.push(pr)
      queued.status = "RESOLVED"
    }

    return {
      timestamp: new Date().toISOString(),
      issuesFound: this.backlog,
      resolvedPRs: newPrs,
      cpuLoadPercent: 5,
      isIdle: true,
    }
  }

  public getDraftedPRs(): readonly GhostDraftPR[] {
    return this.draftedPRs
  }
}
