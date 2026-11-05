import type { HeapDeltaSummary } from './types.js';

export class DeltaFormatter {
  public static format(
    failingInstruction: string,
    rootCause: string,
    line: number,
    rawScope: Record<string, unknown>
  ): HeapDeltaSummary {
    // Sanitize and trim deep prototypes or oversized objects
    const sanitizedHeap: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(rawScope)) {
      if (typeof value === 'function') continue;
      if (typeof value === 'object' && value !== null) {
        // Shallow copy first 2 levels
        const shallow: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
          if (typeof v !== 'function') {
            shallow[k] = v;
          }
        }
        sanitizedHeap[key] = shallow;
      } else {
        sanitizedHeap[key] = value;
      }
    }

    const jsonString = JSON.stringify(sanitizedHeap);
    const tokenEstimate = Math.ceil(jsonString.length / 4);

    return {
      failingInstruction,
      rootCause,
      line,
      scopeHeap: sanitizedHeap,
      tokenEstimate,
    };
  }
}
