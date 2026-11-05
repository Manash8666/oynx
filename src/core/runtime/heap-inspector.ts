import { DeltaFormatter } from './delta-formatter.js';
import type { HeapDeltaSummary } from './types.js';

export class HeapInspector {
  public static inspectException(
    err: Error,
    codeContext: string,
    currentScope: Record<string, unknown>
  ): HeapDeltaSummary {
    const message = err.message;
    const stack = err.stack || '';

    let lineNumber = 1;
    const anonMatch = stack.match(/<anonymous>:(\d+):\d+/);
    if (anonMatch) {
      // Offset by 1 line for the injected 'use strict'; header
      lineNumber = Math.max(1, parseInt(anonMatch[1], 10) - 1);
    } else {
      const lineMatch = stack.match(/:(\d+):\d+/);
      if (lineMatch) {
        lineNumber = parseInt(lineMatch[1], 10);
      }
    }

    const lines = codeContext.split(/\r?\n/).filter((l) => l.trim().length > 0);
    // Locate the line matching the error or use lineNumber
    let failingInstruction = lines[lineNumber - 1] ? lines[lineNumber - 1].trim() : lines[0] || 'unknown';

    // If message mentions property, find line containing that property
    const propMatch = message.match(/reading '([^']+)'/);
    if (propMatch) {
      const prop = propMatch[1];
      const matchLine = lines.find((l) => l.includes(`.${prop}`));
      if (matchLine) {
        failingInstruction = matchLine.trim();
      }
    }

    let rootCause = message;

    // Detect null / undefined dereference
    const nullMatch = message.match(/Cannot read propert(?:ies|y) of (undefined|null) \(reading '([^']+)'\)/i);
    if (nullMatch) {
      rootCause = `dereference of ${nullMatch[1]} on property '${nullMatch[2]}'`;
    }

    return DeltaFormatter.format(failingInstruction, rootCause, lineNumber, currentScope);
  }
}
