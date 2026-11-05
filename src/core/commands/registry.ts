import { EventEmitter } from 'events';
import { ContextKeyStore } from '../context-keys/context-store.js';
import { WhenExpressionEvaluator } from '../context-keys/expression-evaluator.js';
import { ChordRouter } from '../keybindings/chord-router.js';
import type { CommandDefinition, KeybindingBinding } from './types.js';

export class CommandRegistry extends EventEmitter {
  private commands = new Map<string, CommandDefinition>();
  private executionCount = new Map<string, number>();
  private contextStore: ContextKeyStore;
  private chordRouter: ChordRouter;

  constructor(contextStore?: ContextKeyStore) {
    super();
    this.contextStore = contextStore || new ContextKeyStore();
    this.chordRouter = new ChordRouter();
  }

  public getContextStore(): ContextKeyStore {
    return this.contextStore;
  }

  public getChordRouter(): ChordRouter {
    return this.chordRouter;
  }

  public registerCommand(def: CommandDefinition): void {
    this.commands.set(def.id, def);

    if (def.keybinding) {
      const chords = this.chordRouter.parseKeyString(def.keybinding);
      const specificity = WhenExpressionEvaluator.calculateSpecificity(def.when);
      const binding: KeybindingBinding = {
        commandId: def.id,
        chords,
        when: def.when,
        specificity,
      };
      this.chordRouter.registerBinding(binding);
    }

    this.emit('commandRegistered', def);
  }

  public async executeCommand(id: string, ...args: unknown[]): Promise<unknown> {
    const cmd = this.commands.get(id);
    if (!cmd) {
      throw new Error(`Command not found: ${id}`);
    }

    if (cmd.when && !WhenExpressionEvaluator.evaluate(cmd.when, this.contextStore)) {
      throw new Error(`Command '${id}' cannot be executed in current context ('${cmd.when}')`);
    }

    this.executionCount.set(id, (this.executionCount.get(id) || 0) + 1);
    this.emit('commandExecuted', { id, args });
    return await cmd.handler(...args);
  }

  public getCommand(id: string): CommandDefinition | undefined {
    return this.commands.get(id);
  }

  public getAllCommands(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  public getRankedCommands(filterText = ''): CommandDefinition[] {
    const list = this.getAllCommands();
    const query = filterText.toLowerCase().trim();

    return list
      .filter((cmd) => {
        if (!query) return true;
        const text = `${cmd.title} ${cmd.category || ''} ${cmd.id}`.toLowerCase();
        return text.includes(query);
      })
      .sort((a, b) => {
        const countA = this.executionCount.get(a.id) || 0;
        const countB = this.executionCount.get(b.id) || 0;
        return countB - countA;
      });
  }
}

export function populateMasterKeybindings(registry: CommandRegistry): void {
  // 1. VS Code Parity Shortcuts
  registry.registerCommand({
    id: 'workbench.action.showCommands',
    title: 'Command Palette',
    keybinding: 'Ctrl+Shift+P',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'workbench.action.quickOpen',
    title: 'Quick Open / Go to File',
    keybinding: 'Ctrl+P',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'workbench.action.toggleSidebar',
    title: 'Toggle Primary Sidebar',
    keybinding: 'Ctrl+B',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'editor.action.formatDocument',
    title: 'Format Document / File',
    keybinding: 'Shift+Alt+F',
    when: 'editorTextFocus && !editorReadonly',
    handler: () => true,
  });

  // 2. Google Antigravity Parity Shortcuts
  registry.registerCommand({
    id: 'antigravity.toggleAgentHub',
    title: 'Toggle Agent Management Panel',
    keybinding: 'Ctrl+Shift+A',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'antigravity.spawnParallelAgent',
    title: 'Spawn Parallel Background Agent',
    keybinding: 'Ctrl+Shift+Enter',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'antigravity.toggleBrowserPreview',
    title: 'Toggle Embedded Browser Preview',
    keybinding: 'Ctrl+Alt+B',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'antigravity.inspectA11yTree',
    title: 'Inspect Current DOM Accessibility Tree',
    keybinding: 'Ctrl+Alt+A',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'antigravity.exportPlaywrightSpec',
    title: 'Export Browser Session as Test Spec',
    keybinding: 'Ctrl+Shift+E',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'antigravity.killAllAgents',
    title: 'Kill All In-Flight Agent Swarms',
    keybinding: 'Ctrl+Shift+Escape',
    when: 'always',
    handler: () => true,
  });

  // 3. Unique Onyx Subsystem Shortcuts
  registry.registerCommand({
    id: 'onyx.toggleArchitectureCanvas',
    title: 'Toggle Architecture Canvas Mode',
    keybinding: 'Ctrl+Alt+C',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'onyx.calculateBlastRadius',
    title: 'Calculate Symbol Blast-Radius',
    keybinding: 'Ctrl+Alt+R',
    when: 'editorTextFocus',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'onyx.timeTravelStepBack',
    title: 'Time-Travel Scrub (Step Back)',
    keybinding: 'Ctrl+Alt+Left',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'onyx.triggerShadowVm',
    title: 'Trigger Shadow VM Fork Execution',
    keybinding: 'Ctrl+Shift+X',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'onyx.toggleColibriLocal',
    title: 'Toggle Colibri Air-Gap (Local/Cloud)',
    keybinding: 'Ctrl+Shift+L',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'onyx.acceptAllDiffs',
    title: 'Accept All Pending Agent Diffs',
    keybinding: 'Ctrl+Shift+Y',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'onyx.rejectAllDiffs',
    title: 'Reject All Pending Agent Diffs',
    keybinding: 'Ctrl+Shift+N',
    when: 'always',
    handler: () => true,
  });
  registry.registerCommand({
    id: 'onyx.compileMswMock',
    title: 'Compile Network Traffic to MSW Mock',
    keybinding: 'Ctrl+Alt+M',
    when: 'always',
    handler: () => true,
  });
}
