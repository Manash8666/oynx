export interface TrajectoryStep {
  readonly step: number
  readonly action: string
  readonly status: "success" | "failure"
  readonly error?: string
}

export interface ReflectionResult {
  readonly totalSteps: number
  readonly successfulSteps: number
  readonly failedSteps: number
  readonly hadCorrections: boolean
  readonly distilledLearnings: readonly string[]
}

export const runReflectionLoop = (trajectory: readonly TrajectoryStep[]): ReflectionResult => {
  const totalSteps = trajectory.length
  const failedSteps = trajectory.filter((s) => s.status === "failure").length
  const successfulSteps = totalSteps - failedSteps
  const hadCorrections = failedSteps > 0 && trajectory[trajectory.length - 1]?.status === "success"

  const learnings: string[] = []

  for (let i = 0; i < trajectory.length; i++) {
    const step = trajectory[i]
    if (step.status === "failure") {
      const nextSuccessfulStep = trajectory.slice(i + 1).find((s) => s.status === "success")
      if (nextSuccessfulStep) {
        learnings.push(
          `When ${step.action} failed with "${step.error ?? "error"}", recovered via ${nextSuccessfulStep.action}.`,
        )
      } else {
        learnings.push(`${step.action} failed: ${step.error ?? "unresolved failure"}.`)
      }
    }
  }

  if (learnings.length === 0 && totalSteps > 0) {
    learnings.push("Execution succeeded on first attempt with zero regressions.")
  }

  return {
    totalSteps,
    successfulSteps,
    failedSteps,
    hadCorrections,
    distilledLearnings: learnings,
  }
}

