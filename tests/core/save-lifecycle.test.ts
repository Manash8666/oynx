import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SaveManager } from '../../src/core/editor/save/save-manager.js';
import { join } from 'path';
import { readFile, unlink, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

describe('VS Code-Parity Auto-Save, Save Participants & Atomic Persistence Pipeline', () => {
  const testFile = join(process.cwd(), 'temp_save_lifecycle_test.ts');
  let saveManager: SaveManager;

  beforeEach(async () => {
    await writeFile(testFile, 'export const INITIAL = 1;\n', 'utf-8');
  });

  afterEach(async () => {
    if (existsSync(testFile)) {
      await unlink(testFile);
    }
  });

  it('should debounce save execution in afterDelay mode', async () => {
    saveManager = new SaveManager({ mode: 'afterDelay', delayMs: 50 });
    const dirtyTracker = saveManager.getDirtyTracker();
    dirtyTracker.registerDocument(testFile);

    saveManager.updateBuffer(testFile, 'export const MUTATED = 2;   ');
    expect(dirtyTracker.isDirty(testFile)).toBe(true);

    // Wait for debounce timer (50ms) to fire
    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(dirtyTracker.isDirty(testFile)).toBe(false);
    const contentOnDisk = await readFile(testFile, 'utf-8');
    expect(contentOnDisk).toContain('export const MUTATED = 2;');
  });

  it('should immediately save dirty files in onWindowChange mode', async () => {
    saveManager = new SaveManager({ mode: 'onWindowChange' });
    const dirtyTracker = saveManager.getDirtyTracker();
    dirtyTracker.registerDocument(testFile);

    saveManager.updateBuffer(testFile, 'export const WINDOW_SAVE = 42;');
    expect(dirtyTracker.isDirty(testFile)).toBe(true);

    // Trigger window blur
    saveManager.onWindowChange();

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(dirtyTracker.isDirty(testFile)).toBe(false);
    const content = await readFile(testFile, 'utf-8');
    expect(content).toContain('WINDOW_SAVE = 42;');
  });

  it('should execute pre-save participant formatting (trailing whitespace & imports) before disk write', async () => {
    saveManager = new SaveManager({ mode: 'off' });
    const unorganizedCode = `
import { Z } from './z.js';
import { A } from './a.js';

export const result = 100;    
`.trim();

    saveManager.updateBuffer(testFile, unorganizedCode);
    const result = await saveManager.saveDocument(testFile);

    expect(result.success).toBe(true);
    expect(result.participantsExecuted).toContain('trimTrailingWhitespace');
    expect(result.participantsExecuted).toContain('organizeImports');

    const diskCode = await readFile(testFile, 'utf-8');
    // Verify imports sorted alphabetically
    expect(diskCode.indexOf("from './a.js'")).toBeLessThan(diskCode.indexOf("from './z.js'"));
    // Verify trailing whitespace stripped
    expect(diskCode).not.toMatch(/100;\s\s+/);
  });

  it('should preserve original file cleanly if atomic write fails midway', async () => {
    saveManager = new SaveManager({ mode: 'off' });
    const invalidPath = join(process.cwd(), 'non_existent_folder_xyz_123', 'file.ts');

    saveManager.updateBuffer(invalidPath, 'const broken = true;');
    const result = await saveManager.saveDocument(invalidPath);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    // Verify temporary files are cleaned up
    expect(existsSync(invalidPath)).toBe(false);
  });
});
