import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PtySupervisor } from '../../src/core/terminal/pty-supervisor.js';
import { AnsiCleaner } from '../../src/core/terminal/ansi-cleaner.js';
import { InteractiveTrapsMonitor } from '../../src/core/terminal/interactive-traps.js';

describe('Real-Time Interactive Terminal & Process Supervisor (Prompt 3)', () => {
  let pty: PtySupervisor;

  beforeEach(() => {
    pty = new PtySupervisor();
  });

  afterEach(() => {
    pty.terminateAll();
  });

  describe('AnsiCleaner', () => {
    it('should strip terminal escape sequences, color codes, and cursor moves', () => {
      const rawAnsi = '\u001b[31;1mError:\u001b[0m \u001b[33mVariable undefined\u001b[0m\r\n\u001b[2K\u001b[1GAll clear!';
      const clean = AnsiCleaner.clean(rawAnsi);

      expect(clean).not.toContain('\u001b[');
      expect(clean).toContain('Error: Variable undefined');
      expect(clean).toContain('All clear!');
    });
  });

  describe('InteractiveTrapsMonitor', () => {
    it('should detect y/n and yes/no prompts and suggest automatic answer', () => {
      const monitor = new InteractiveTrapsMonitor();

      let emitted = false;
      monitor.on('AGENT_STDIN_REQUIRED', (evt) => {
        emitted = true;
        expect(evt.suggestedAnswer).toBe('y\n');
      });

      const trap = monitor.detectPrompt('Do you want to proceed? (y/n): ');
      expect(trap).not.toBeNull();
      expect(trap?.suggestedAnswer).toBe('y\n');
      expect(emitted).toBe(true);
    });

    it('should detect press enter to continue', () => {
      const monitor = new InteractiveTrapsMonitor();
      const trap = monitor.detectPrompt('Press enter to continue...');
      expect(trap).not.toBeNull();
      expect(trap?.suggestedAnswer).toBe('\n');
    });

    it('should detect questions with default value', () => {
      const monitor = new InteractiveTrapsMonitor();
      const trap = monitor.detectPrompt('? Project name: (default: onyx-app)');
      expect(trap).not.toBeNull();
      expect(trap?.suggestedAnswer).toBe('\n');
    });
  });

  describe('PtySupervisor Process Lifecycle & Timeout', () => {
    it('should execute command and return clean stdout and exit code', async () => {
      const res = await pty.execute('node', ['-e', 'console.log("HELLO_PtySupervisor_OK")']);
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain('HELLO_PtySupervisor_OK');
      expect(res.timedOut).toBe(false);
    });

    it('should terminate process gracefully on idle timeout', async () => {
      // Run node script that sleeps infinitely with 500ms timeout
      const res = await pty.execute(
        'node',
        ['-e', 'setInterval(() => {}, 1000)'],
        { idleTimeoutMs: 500 }
      );

      expect(res.timedOut).toBe(true);
    });
  });
});
