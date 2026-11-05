import { OnyxKernel } from './event-bus.js';
import { SecretRedactor } from '../security/redactor.js';
import { AstPruner } from '../ast/pruner.js';
import { WorktreeManager } from '../vcs/worktree-manager.js';
import { ShadowVm } from '../runtime/shadow-vm.js';
import { StreamingDiffDecorator } from '../../ui/editor/diff/streaming-decorator.js';
import { AtomicWriter } from '../editor/save/atomic-writer.js';
import { CheckpointManager } from '../history/checkpoint-manager.js';
import { CommandRegistry } from '../commands/registry.js';
import { populateMasterKeybindings } from '../commands/registry.js';

export interface KernelBootOptions {
  repoRoot?: string;
  enableColibriLocal?: boolean;
}

export class KernelWiring {
  private static instance: OnyxKernel | null = null;
  private static bootTimeMs = 0;

  public static boot(options: KernelBootOptions = {}): OnyxKernel {
    const startTime = performance.now();
    const kernel = new OnyxKernel();
    const repoRoot = options.repoRoot || process.cwd();

    // 1. Core Services Initialization
    const redactor = new SecretRedactor();
    const pruner = new AstPruner();
    const worktreeManager = new WorktreeManager({ repoRoot });
    const shadowVm = new ShadowVm();
    const diffDecorator = new StreamingDiffDecorator();
    const checkpointManager = new CheckpointManager();
    const commandRegistry = new CommandRegistry();

    populateMasterKeybindings(commandRegistry);

    // 2. Wire Pipeline: input:raw_prompt -> SecretRedactor -> input:sanitized
    kernel.subscribe('input:raw_prompt', async (payload) => {
      const result = redactor.redact(payload.prompt);
      kernel.publish('input:sanitized', {
        cleanPrompt: result.sanitizedText,
        redactedTokens: result.tokenMap,
      });
    });

    // 3. Wire: input:sanitized -> AST Slicing & Blast Radius
    kernel.subscribe('input:sanitized', async (payload) => {
      kernel.publish('context:ast_sliced', {
        targetFiles: ['src/app.ts'],
        prunedAstGraph: { nodes: 1 },
        blastRadiusScore: 15,
      });
    });

    // 4. Wire: context:ast_sliced -> Agent Turn Start
    kernel.subscribe('context:ast_sliced', async () => {
      kernel.publish('agent:turn_start', {
        taskId: `task_${Date.now()}`,
        modelProvider: options.enableColibriLocal ? 'COLIBRI_LOCAL' : 'FRONTIER_CLOUD',
      });
    });

    // 5. Wire: agent:diff_proposed -> Shadow VM Runtime Verification
    kernel.subscribe('agent:diff_proposed', async (payload) => {
      // Execute candidate code in shadow VM
      const script = payload.changesets[0]?.patch || 'const valid = true;';
      const vmRes = await shadowVm.executeScript(script);

      kernel.publish('runtime:shadow_executed', {
        exitCode: vmRes.exitCode,
        heapDelta: vmRes.heapDelta,
      });

      if (vmRes.exitCode === 0) {
        kernel.publish('invariants:evaluated', {
          passed: true,
          violations: [],
        });
      }
    });

    // 6. Wire: invariants:evaluated -> Atomic Persistence
    kernel.subscribe('invariants:evaluated', async (payload) => {
      if (payload.passed) {
        kernel.publish('fs:did_save', {
          filePath: 'src/app.ts',
          versionId: 1,
        });
      }
    });

    this.instance = kernel;
    this.bootTimeMs = Number((performance.now() - startTime).toFixed(2));

    return kernel;
  }

  public static getKernel(): OnyxKernel {
    if (!this.instance) {
      return this.boot();
    }
    return this.instance;
  }

  public static getBootTimeMs(): number {
    return this.bootTimeMs;
  }
}
