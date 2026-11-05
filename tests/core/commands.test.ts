import { describe, it, expect, beforeEach } from 'vitest';
import { ContextKeyStore } from '../../src/core/context-keys/context-store.js';
import { WhenExpressionEvaluator } from '../../src/core/context-keys/expression-evaluator.js';
import { ChordRouter } from '../../src/core/keybindings/chord-router.js';
import { CommandRegistry } from '../../src/core/commands/registry.js';

describe('Command Palette & Context-Key (when Clause) Trie Router (Prompt 2)', () => {
  let contextStore: ContextKeyStore;
  let registry: CommandRegistry;

  beforeEach(() => {
    contextStore = new ContextKeyStore();
    registry = new CommandRegistry(contextStore);
  });

  describe('WhenExpressionEvaluator', () => {
    it('should evaluate complex boolean expressions with negation, regex, and equality', () => {
      contextStore.set('editorTextFocus', true);
      contextStore.set('editorReadonly', false);
      contextStore.set('gitBranch', 'feature/auth-guard');

      // Test a && !b
      expect(
        WhenExpressionEvaluator.evaluate('editorTextFocus && !editorReadonly', contextStore)
      ).toBe(true);

      // Test regex match: c =~ /pattern/
      expect(
        WhenExpressionEvaluator.evaluate('gitBranch =~ /feature\\/.*/', contextStore)
      ).toBe(true);

      // Test complex expression: a && !b || c =~ /test/
      expect(
        WhenExpressionEvaluator.evaluate(
          'editorTextFocus && !editorReadonly || gitBranch =~ /test/',
          contextStore
        )
      ).toBe(true);

      // Test missing keys safely evaluate to false without crashing
      expect(
        WhenExpressionEvaluator.evaluate('nonExistentKey && editorTextFocus', contextStore)
      ).toBe(false);
    });

    it('should evaluate within sub-millisecond latency (<0.2ms)', () => {
      contextStore.set('isDebugging', true);
      const start = performance.now();
      for (let i = 0; i < 50; i++) {
        WhenExpressionEvaluator.evaluate('isDebugging && !editorReadonly', contextStore);
      }
      const avgDuration = (performance.now() - start) / 50;
      expect(avgDuration).toBeLessThan(0.2);
    });
  });

  describe('ChordRouter (Multi-Step Sequences & Specificity)', () => {
    it('should resolve multi-step chorded keybindings (e.g. Ctrl+K Ctrl+C)', () => {
      const router = registry.getChordRouter();

      registry.registerCommand({
        id: 'editor.commentLine',
        title: 'Comment Line',
        keybinding: 'Ctrl+K Ctrl+C',
        when: 'editorTextFocus',
        handler: () => 'commented',
      });

      contextStore.set('editorTextFocus', true);

      // Press 1st chord: Ctrl+K
      const firstHit = router.handleKeyPress(
        { ctrl: true, meta: false, alt: false, shift: false, key: 'k' },
        contextStore
      );
      expect(firstHit).toBeUndefined(); // Pending sequence
      expect(router.getActiveChordDisplay()).toBe('ctrl+k');

      // Press 2nd chord: Ctrl+C
      const secondHit = router.handleKeyPress(
        { ctrl: true, meta: false, alt: false, shift: false, key: 'c' },
        contextStore
      );
      expect(secondHit).toBe('editor.commentLine');
      expect(router.getActiveChordDisplay()).toBe('');
    });

    it('should resolve conflicting keybindings by highest specificity score', () => {
      const router = registry.getChordRouter();

      // Lower specificity command
      registry.registerCommand({
        id: 'general.format',
        title: 'Format',
        keybinding: 'Cmd+F',
        when: 'always',
        handler: () => 'generic_format',
      });

      // Higher specificity command with more conditions
      registry.registerCommand({
        id: 'editor.formatSelection',
        title: 'Format Selection',
        keybinding: 'Cmd+F',
        when: 'editorTextFocus && editorHasSelection && !editorReadonly',
        handler: () => 'selection_format',
      });

      contextStore.set('editorTextFocus', true);
      contextStore.set('editorHasSelection', true);
      contextStore.set('editorReadonly', false);

      const resolved = router.handleKeyPress(
        { ctrl: false, meta: true, alt: false, shift: false, key: 'f' },
        contextStore
      );

      // Should choose higher specificity command
      expect(resolved).toBe('editor.formatSelection');
    });
  });

  describe('CommandRegistry & Fuzzy Search', () => {
    it('should rank commands by execution frequency and filter matches', async () => {
      registry.registerCommand({
        id: 'git.commit',
        title: 'Git: Commit All Staged',
        category: 'Git',
        handler: () => true,
      });

      registry.registerCommand({
        id: 'git.push',
        title: 'Git: Push Origin',
        category: 'Git',
        handler: () => true,
      });

      // Execute git.push twice
      await registry.executeCommand('git.push');
      await registry.executeCommand('git.push');

      const ranked = registry.getRankedCommands('Git');
      expect(ranked.length).toBe(2);
      expect(ranked[0].id).toBe('git.push'); // Ranked first due to usage
    });
  });
});
