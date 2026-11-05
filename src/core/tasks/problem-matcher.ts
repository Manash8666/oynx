import { EventEmitter } from 'events';
import type { ExtractedProblem, ProblemMatcherDefinition, ProblemSeverity } from './types.js';

export class ProblemMatcher extends EventEmitter {
  private definition: ProblemMatcherDefinition;
  private isWatching = false;

  public static readonly PRESETS: Record<string, ProblemMatcherDefinition> = {
    $tsc: {
      name: '$tsc',
      owner: 'typescript',
      patterns: [
        {
          // e.g. src/index.ts(12,5): error TS2322: Type 'string' is not assignable to type 'number'.
          // or src/index.ts:12:5 - error TS2322: ...
          regexp: /^([^\s].*?)(?:\((\d+),(\d+)\)|:(\d+):(\d+))\s*[:-]\s*(error|warning|info)\s+TS(\d+):\s*(.*)$/,
          file: 1,
          line: 2, // or 4
          column: 3, // or 5
          severity: 6,
          code: 7,
          message: 8,
        },
      ],
      background: {
        beginsPattern: /Starting compilation in watch mode\.\.\./i,
        endsPattern: /Found (\d+) errors?\. Watching for file changes\./i,
      },
    },
    $eslint: {
      name: '$eslint',
      owner: 'eslint',
      patterns: [
        {
          // e.g. src/app.ts: line 10, col 5, Error - 'x' is defined but never used. (no-unused-vars)
          // or /path/file.js:10:5: error 'x' is defined [no-unused-vars]
          regexp: /^(.*?):(?:\s*line\s*)?(\d+):(?:\s*col\s*)?(\d+)[:\s]+(error|warning)\s+(.*?)(?:\s+\[?\(?([a-zA-Z0-9_-]+)\)?\]?)?$/i,
          file: 1,
          line: 2,
          column: 3,
          severity: 4,
          message: 5,
          code: 6,
        },
      ],
    },
    $gcc: {
      name: '$gcc',
      owner: 'gcc',
      patterns: [
        {
          // e.g. main.c:15:3: error: expected ';' before '}' token
          regexp: /^(.*?):(\d+):(\d+):\s*(error|warning|note):\s*(.*)$/i,
          file: 1,
          line: 2,
          column: 3,
          severity: 4,
          message: 5,
        },
      ],
    },
  };

  constructor(definition: ProblemMatcherDefinition | string = '$tsc') {
    super();
    if (typeof definition === 'string') {
      this.definition = ProblemMatcher.PRESETS[definition] || ProblemMatcher.PRESETS['$tsc'];
    } else {
      this.definition = definition;
    }
  }

  public parseChunk(chunk: string, cwd = ''): ExtractedProblem[] {
    const problems: ExtractedProblem[] = [];
    const lines = chunk.split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // Check background watcher patterns
      if (this.definition.background) {
        if (this.definition.background.beginsPattern.test(line)) {
          this.isWatching = true;
          this.emit('watchBegins');
        }
        if (this.definition.background.endsPattern.test(line)) {
          this.emit('watchEnds');
        }
      }

      // Check matcher patterns
      for (const pat of this.definition.patterns) {
        const match = line.match(pat.regexp);
        if (match) {
          const rawFile = match[pat.file];
          const rawLineNum = match[pat.line] || match[4];
          const rawColNum = pat.column ? match[pat.column] || match[5] : undefined;
          const rawSeverity = pat.severity ? match[pat.severity]?.toLowerCase() : 'error';
          const rawCode = pat.code ? match[pat.code] : undefined;
          const rawMessage = match[pat.message];

          const severity: ProblemSeverity =
            rawSeverity === 'warning' ? 'warning' : rawSeverity === 'info' || rawSeverity === 'note' ? 'info' : 'error';

          const problem: ExtractedProblem = {
            filePath: rawFile,
            line: parseInt(rawLineNum, 10),
            column: rawColNum ? parseInt(rawColNum, 10) : undefined,
            severity,
            code: rawCode,
            message: rawMessage,
            source: this.definition.owner || this.definition.name,
          };

          problems.push(problem);
          this.emit('problem', problem);
        }
      }
    }

    return problems;
  }
}
