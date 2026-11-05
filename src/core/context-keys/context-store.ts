import { EventEmitter } from 'events';

export class ContextKeyStore extends EventEmitter {
  private context = new Map<string, unknown>();

  constructor(initialValues?: Record<string, unknown>) {
    super();
    if (initialValues) {
      for (const [k, v] of Object.entries(initialValues)) {
        this.context.set(k, v);
      }
    }
  }

  public set(key: string, value: unknown): void {
    const prev = this.context.get(key);
    if (prev !== value) {
      this.context.set(key, value);
      this.emit('contextChanged', { key, value, previousValue: prev });
    }
  }

  public get(key: string): unknown {
    return this.context.get(key);
  }

  public has(key: string): boolean {
    return this.context.has(key);
  }

  public getSnapshot(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of this.context.entries()) {
      obj[k] = v;
    }
    return obj;
  }
}
