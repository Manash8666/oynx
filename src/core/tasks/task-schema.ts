import type { OnyxTaskConfig } from './types.js';

export class TaskSchemaParser {
  public static parseTasksJson(jsonContent: string): OnyxTaskConfig[] {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed.tasks)) {
        return parsed.tasks as OnyxTaskConfig[];
      }
      return [];
    } catch {
      return [];
    }
  }

  public static validateTask(task: OnyxTaskConfig): boolean {
    return Boolean(task.label && task.command);
  }
}
