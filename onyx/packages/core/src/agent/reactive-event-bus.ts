export type ReactiveEventType =
  | "FILE_CHANGED"
  | "TESTS_COMPLETED"
  | "SUBAGENT_MESSAGE"
  | "HEALING_REQUIRED"
  | "TASK_FINISHED"

export interface ReactiveEvent<T = any> {
  readonly id: string
  readonly type: ReactiveEventType
  readonly timestamp: number
  readonly payload: T
}

export class ReactiveEventBus {
  private listeners: Map<ReactiveEventType, Array<(event: ReactiveEvent) => void>> = new Map()

  public subscribe<T = any>(
    type: ReactiveEventType,
    handler: (event: ReactiveEvent<T>) => void
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(handler)

    return () => {
      const arr = this.listeners.get(type) ?? []
      const idx = arr.indexOf(handler)
      if (idx !== -1) arr.splice(idx, 1)
    }
  }

  public emit<T = any>(type: ReactiveEventType, payload: T): ReactiveEvent<T> {
    const event: ReactiveEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: Date.now(),
      payload,
    }

    const handlers = this.listeners.get(type) ?? []
    for (const h of handlers) {
      try {
        h(event)
      } catch (err) {
        console.error(`[EventBus] Error in handler for ${type}:`, err)
      }
    }

    return event
  }

  /**
   * Reactive wakeup without polling: Awaits the next matching event or times out.
   */
  public waitForEvent<T = any>(
    type: ReactiveEventType,
    timeoutMs = 5000
  ): Promise<ReactiveEvent<T>> {
    return new Promise((resolve, reject) => {
      let timer: any
      const unsubscribe = this.subscribe<T>(type, (evt) => {
        clearTimeout(timer)
        unsubscribe()
        resolve(evt)
      })

      timer = setTimeout(() => {
        unsubscribe()
        reject(new Error(`Timeout waiting for event '${type}' after ${timeoutMs}ms`))
      }, timeoutMs)
    })
  }
}

export interface SubagentContextScope {
  readonly subagentId: string
  readonly role: string
  readonly parentConversationId: string
  readonly tokenBudget: number
  tokensUsed: number
  contextHistory: string[]
}

export class ContextIsolatedSubagentManager {
  private scopes: Map<string, SubagentContextScope> = new Map()

  public createIsolatedScope(
    role: string,
    parentConversationId: string,
    tokenBudget = 8192
  ): SubagentContextScope {
    const subagentId = `sub-${role.toLowerCase()}-${Date.now().toString(36)}`
    const scope: SubagentContextScope = {
      subagentId,
      role,
      parentConversationId,
      tokenBudget,
      tokensUsed: 0,
      contextHistory: [],
    }
    this.scopes.set(subagentId, scope)
    return scope
  }

  public appendMessage(subagentId: string, message: string): boolean {
    const scope = this.scopes.get(subagentId)
    if (!scope) return false

    const estimatedTokens = Math.ceil(message.length / 4)
    if (scope.tokensUsed + estimatedTokens > scope.tokenBudget) {
      return false // Token budget exceeded for this isolated scope
    }

    scope.contextHistory.push(message)
    scope.tokensUsed += estimatedTokens
    return true
  }

  /**
   * Synthesizes a compact summary to return to the parent agent,
   * keeping the parent context clean and unpolluted.
   */
  public synthesizeArtifact(subagentId: string): string {
    const scope = this.scopes.get(subagentId)
    if (!scope) return ""

    return `[Subagent: ${scope.role}] Task completed within isolated budget (${scope.tokensUsed}/${scope.tokenBudget} tokens). Output: ${scope.contextHistory.slice(-1)[0] ?? "Done"}`
  }
}
