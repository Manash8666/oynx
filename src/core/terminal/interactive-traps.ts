import { EventEmitter } from 'events';
import type { InteractiveTrapDetection } from './types.js';

export interface InteractiveTrapOptions {
  autoRespond?: boolean;
  defaultAnswer?: string;
}

export class InteractiveTrapsMonitor extends EventEmitter {
  private static readonly PROMPT_PATTERNS: Array<{ regex: RegExp; defaultResponse: string }> = [
    { regex: /\b(yes\/no|y\/n|proceed\?\s*\[y\/n\])\b/i, defaultResponse: 'y\n' },
    { regex: /\b(press\s+enter\s+to\s+continue)\b/i, defaultResponse: '\n' },
    { regex: /\bpassword:\s*$/i, defaultResponse: '\n' },
    { regex: /\?\s+.*\(default:\s*([^)]*)\)/i, defaultResponse: '\n' },
    { regex: /\[\?\]\s+.*\?\s*$/i, defaultResponse: '\n' },
    { regex: /\bdo\s+you\s+want\s+to\s+(?:proceed|continue)\?\b/i, defaultResponse: 'y\n' },
  ];

  public detectPrompt(text: string, lineNumber = 1): InteractiveTrapDetection | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    for (const pattern of InteractiveTrapsMonitor.PROMPT_PATTERNS) {
      if (pattern.regex.test(trimmed)) {
        const detection: InteractiveTrapDetection = {
          promptText: trimmed,
          matchedPattern: pattern.regex.source,
          suggestedAnswer: pattern.defaultResponse,
          line: lineNumber,
        };
        this.emit('AGENT_STDIN_REQUIRED', detection);
        return detection;
      }
    }

    return null;
  }
}
