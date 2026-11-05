import { EventEmitter } from 'events';
import type { BreakpointRecord, SourceBreakpoint } from './types.js';

export class BreakpointStore extends EventEmitter {
  private breakpoints = new Map<string, BreakpointRecord[]>(); // filePath -> BreakpointRecord[]

  public setBreakpoints(filePath: string, bpInputs: SourceBreakpoint[]): BreakpointRecord[] {
    const list: BreakpointRecord[] = bpInputs.map((bp, idx) => ({
      id: `bp_${filePath}_${bp.line}_${idx}`,
      filePath,
      line: bp.line,
      condition: bp.condition,
      hitCondition: bp.hitCondition,
      verified: bp.verified ?? true,
    }));

    this.breakpoints.set(filePath, list);
    this.emit('breakpointsUpdated', { filePath, breakpoints: list });
    return list;
  }

  public getBreakpoints(filePath: string): BreakpointRecord[] {
    return this.breakpoints.get(filePath) || [];
  }

  public getAllBreakpoints(): BreakpointRecord[] {
    const all: BreakpointRecord[] = [];
    for (const list of this.breakpoints.values()) {
      all.push(...list);
    }
    return all;
  }

  /**
   * Re-anchor line offsets when a document is edited
   */
  public reanchorBreakpoints(filePath: string, editStartLine: number, deltaLines: number): void {
    const list = this.breakpoints.get(filePath);
    if (!list || deltaLines === 0) return;

    for (const bp of list) {
      if (bp.line >= editStartLine) {
        bp.line = Math.max(1, bp.line + deltaLines);
      }
    }
    this.emit('breakpointsUpdated', { filePath, breakpoints: list });
  }

  public clear(filePath?: string): void {
    if (filePath) {
      this.breakpoints.delete(filePath);
    } else {
      this.breakpoints.clear();
    }
  }
}
