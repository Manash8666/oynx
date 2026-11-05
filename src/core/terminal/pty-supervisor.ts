import { spawn, type ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { AnsiCleaner } from './ansi-cleaner.js';
import { InteractiveTrapsMonitor } from './interactive-traps.js';
import type {
  InteractiveTrapDetection,
  ProcessSpawnOptions,
  TerminalChunkEvent,
  TerminalExecutionResult,
} from './types.js';

export class PtySupervisor extends EventEmitter {
  private activeProcesses = new Set<ChildProcess>();
  private trapMonitor: InteractiveTrapsMonitor;

  constructor() {
    super();
    this.trapMonitor = new InteractiveTrapsMonitor();

    // Register process exit and SIGINT handlers to prevent zombie processes
    process.on('exit', () => this.terminateAll());
    process.on('SIGINT', () => {
      this.terminateAll();
      process.exit(130);
    });
  }

  public getTrapMonitor(): InteractiveTrapsMonitor {
    return this.trapMonitor;
  }

  public async execute(
    command: string,
    args: string[] = [],
    options: ProcessSpawnOptions & { autoRespond?: boolean } = {}
  ): Promise<TerminalExecutionResult> {
    const idleTimeoutMs = options.idleTimeoutMs ?? 30000;
    const maxBufferLines = options.maxBufferLines ?? 50000;
    const autoRespond = options.autoRespond ?? true;

    return new Promise<TerminalExecutionResult>((resolve) => {
      const isWindows = process.platform === 'win32';
      const useShell = options.shell ?? false;
      const shellPath = typeof options.shell === 'string' ? options.shell : isWindows ? 'powershell.exe' : '/bin/sh';

      let child: ChildProcess;
      try {
        if (useShell) {
          const fullCmd = [command, ...args].join(' ');
          child = spawn(shellPath, [isWindows ? '-Command' : '-c', fullCmd], {
            cwd: options.cwd || process.cwd(),
            env: { ...process.env, ...options.env },
            stdio: ['pipe', 'pipe', 'pipe'],
          });
        } else {
          child = spawn(command, args, {
            cwd: options.cwd || process.cwd(),
            env: { ...process.env, ...options.env },
            stdio: ['pipe', 'pipe', 'pipe'],
          });
        }
      } catch (err: unknown) {
        return resolve({
          command,
          exitCode: 1,
          stdout: '',
          stderr: String(err),
          rawAnsi: '',
          timedOut: false,
          interactivePromptsDetected: [],
        });
      }

      this.activeProcesses.add(child);

      let stdoutAccum = '';
      let stderrAccum = '';
      let rawAnsiAccum = '';
      let timedOut = false;
      const promptsDetected: InteractiveTrapDetection[] = [];

      let idleTimer: NodeJS.Timeout | null = null;
      let lineCount = 0;

      const resetIdleTimer = () => {
        if (idleTimer) clearTimeout(idleTimer);
        if (idleTimeoutMs > 0) {
          idleTimer = setTimeout(() => {
            timedOut = true;
            this.killProcessGracefully(child);
          }, idleTimeoutMs);
        }
      };

      resetIdleTimer();

      const handleChunk = (chunk: Buffer, isStderr: boolean) => {
        resetIdleTimer();
        const rawStr = chunk.toString();
        const cleanChunk = AnsiCleaner.clean(rawStr);

        rawAnsiAccum += rawStr;
        if (isStderr) {
          stderrAccum += cleanChunk;
        } else {
          stdoutAccum += cleanChunk;
        }

        // Buffer line capping
        const chunkLines = cleanChunk.split('\n');
        lineCount += chunkLines.length;

        if (lineCount > maxBufferLines) {
          const lines = stdoutAccum.split('\n');
          stdoutAccum = lines.slice(lines.length - maxBufferLines).join('\n');
          lineCount = maxBufferLines;
        }

        const eventPayload: TerminalChunkEvent = {
          rawAnsi: rawStr,
          cleanText: cleanChunk,
          timestamp: Date.now(),
        };
        this.emit('data', eventPayload);

        // Check for interactive traps on recent lines
        for (let idx = 0; idx < chunkLines.length; idx++) {
          const line = chunkLines[idx];
          const detected = this.trapMonitor.detectPrompt(line, lineCount - chunkLines.length + idx);
          if (detected) {
            promptsDetected.push(detected);
            if (autoRespond && child.stdin && child.stdin.writable) {
              child.stdin.write(detected.suggestedAnswer);
            }
          }
        }
      };

      child.stdout?.on('data', (c: Buffer) => handleChunk(c, false));
      child.stderr?.on('data', (c: Buffer) => handleChunk(c, true));

      child.on('close', (code) => {
        if (idleTimer) clearTimeout(idleTimer);
        this.activeProcesses.delete(child);

        resolve({
          command,
          pid: child.pid,
          exitCode: code ?? (timedOut ? 124 : 0),
          stdout: stdoutAccum,
          stderr: stderrAccum,
          rawAnsi: rawAnsiAccum,
          timedOut,
          interactivePromptsDetected: promptsDetected,
        });
      });

      child.on('error', (err) => {
        if (idleTimer) clearTimeout(idleTimer);
        this.activeProcesses.delete(child);

        resolve({
          command,
          pid: child.pid,
          exitCode: 1,
          stdout: stdoutAccum,
          stderr: stderrAccum + '\n' + err.message,
          rawAnsi: rawAnsiAccum,
          timedOut,
          interactivePromptsDetected: promptsDetected,
        });
      });
    });
  }

  public terminateAll(): void {
    for (const child of this.activeProcesses) {
      this.killProcessGracefully(child);
    }
    this.activeProcesses.clear();
  }

  private killProcessGracefully(child: ChildProcess): void {
    try {
      child.kill('SIGTERM');
      const killTimer = setTimeout(() => {
        try {
          if (!child.killed) child.kill('SIGKILL');
        } catch {
          // ignore
        }
      }, 3000);
      killTimer.unref();
    } catch {
      // ignore
    }
  }
}
