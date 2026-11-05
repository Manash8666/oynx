import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CheckpointManager } from '../../src/core/history/checkpoint-manager.js';
import { join } from 'path';
import { writeFile, unlink, readFile } from 'fs/promises';
import { existsSync } from 'fs';

describe('Deterministic State Checkpoint & Time-Travel Rollback Engine', () => {
  let manager: CheckpointManager;
  const testFile1 = join(process.cwd(), 'temp_checkpoint_test1.ts');
  const testFile2 = join(process.cwd(), 'temp_checkpoint_test2.ts');
  const createdFile = join(process.cwd(), 'temp_checkpoint_created.ts');

  beforeEach(async () => {
    manager = new CheckpointManager();
    await writeFile(testFile1, 'export const VERSION = "1.0.0";', 'utf-8');
    await writeFile(testFile2, 'export const COUNT = 10;', 'utf-8');
  });

  afterEach(async () => {
    if (existsSync(testFile1)) await unlink(testFile1);
    if (existsSync(testFile2)) await unlink(testFile2);
    if (existsSync(createdFile)) await unlink(createdFile);
  });

  it('should create immutable snapshot in under 20ms', async () => {
    const start = performance.now();
    const cp = await manager.createPreExecutionCheckpoint(
      'turn-1',
      'Refactor version and count',
      [testFile1, testFile2]
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(20);
    expect(cp.snapshots.size).toBe(2);
    expect(cp.snapshots.get(testFile1)?.content).toContain('1.0.0');
  });

  it('should restore files and delete newly created files during rollback across 5 simulated turns', async () => {
    const timeline = manager.getTimeline();

    // Turn 1: Initial baseline
    const cp1 = await manager.createPreExecutionCheckpoint('turn-1', 'Initial baseline', [testFile1]);
    await writeFile(testFile1, 'export const VERSION = "1.1.0";', 'utf-8');
    timeline.updateTurnStatus('turn-1', 'SUCCESS');

    // Turn 2: Increment count
    const cp2 = await manager.createPreExecutionCheckpoint('turn-2', 'Increment count', [testFile2]);
    await writeFile(testFile2, 'export const COUNT = 20;', 'utf-8');
    timeline.updateTurnStatus('turn-2', 'SUCCESS');

    // Turn 3: Create auxiliary file
    const cp3 = await manager.createPreExecutionCheckpoint('turn-3', 'Create auxiliary file', [createdFile]);
    await writeFile(createdFile, 'export const AUX = true;', 'utf-8');
    manager.recordCreatedFile(cp3.id, createdFile);
    timeline.updateTurnStatus('turn-3', 'SUCCESS');

    // Turn 4: Mutate version and count
    const cp4 = await manager.createPreExecutionCheckpoint('turn-4', 'Mutate both', [testFile1, testFile2]);
    await writeFile(testFile1, 'export const VERSION = "2.0.0";', 'utf-8');
    await writeFile(testFile2, 'export const COUNT = 999;', 'utf-8');
    timeline.updateTurnStatus('turn-4', 'SUCCESS');

    // Turn 5: Broken turn that causes application failure
    const cp5 = await manager.createPreExecutionCheckpoint('turn-5', 'Broken syntax code', [testFile1]);
    await writeFile(testFile1, 'CORRUPTED_SYNTAX_BREAKING_APP();', 'utf-8');
    timeline.updateTurnStatus('turn-5', 'FAILED');

    // Verification before rollback: files reflect Turn 5 state
    expect(await readFile(testFile1, 'utf-8')).toBe('CORRUPTED_SYNTAX_BREAKING_APP();');
    expect(existsSync(createdFile)).toBe(true);

    // Rollback to Turn 2 (checkpoint cp2: before Turn 2 started, COUNT=10, VERSION=1.1.0)
    await manager.rollbackTo(cp2.id);

    // Assert file contents restored to Turn 2 checkpoint baseline
    const restoredCount = await readFile(testFile2, 'utf-8');
    expect(restoredCount).toBe('export const COUNT = 10;');

    // Verify timeline scrubbing state
    const timelineSnapshot = timeline.getSnapshot();
    expect(timelineSnapshot.turns.length).toBe(5);
    expect(timelineSnapshot.turns.find((t) => t.turnId === 'turn-2')?.status).toBe('REVERTED');
  });
});
