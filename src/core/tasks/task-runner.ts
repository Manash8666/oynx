import { EventEmitter } from 'events';
import { ProblemMatcher } from './problem-matcher.js';
import { ProblemStore } from './problem-store.js';
import type { OnyxTaskConfig } from './types.js';

export class TaskRunner extends EventEmitter {
  private problemStore: ProblemStore;
  private runningTasks = new Map<string, { config: OnyxTaskConfig; matcher: ProblemMatcher }>();

  constructor(problemStore?: ProblemStore) {
    super();
    this.problemStore = problemStore || new ProblemStore();
  }

  public getProblemStore(): ProblemStore {
    return this.problemStore;
  }

  public async runTask(task: OnyxTaskConfig, simulatedOutput?: string): Promise<{ exitCode: number; problemsCount: number }> {
    const matcher = new ProblemMatcher(task.problemMatcher || '$tsc');
    this.runningTasks.set(task.label, { config: task, matcher });

    this.emit('taskStarted', { label: task.label });

    let problemsCount = 0;
    if (simulatedOutput) {
      const extracted = matcher.parseChunk(simulatedOutput, task.cwd || '');
      this.problemStore.addProblems(extracted);
      problemsCount = extracted.length;
    }

    this.runningTasks.delete(task.label);
    this.emit('taskFinished', { label: task.label, problemsCount });

    return {
      exitCode: problemsCount > 0 ? 1 : 0,
      problemsCount,
    };
  }
}
