import type { KeyChord, KeybindingBinding } from '../commands/types.js';
import type { ContextKeyStore } from '../context-keys/context-store.js';
import { WhenExpressionEvaluator } from '../context-keys/expression-evaluator.js';

interface TrieNode {
  commandId?: string;
  binding?: KeybindingBinding;
  children: Map<string, TrieNode>;
}

export class ChordRouter {
  private root: TrieNode = { children: new Map() };
  private bindings: KeybindingBinding[] = [];
  private activeChordSequence: KeyChord[] = [];
  private chordTimer: NodeJS.Timeout | null = null;
  private chordTimeoutMs = 2000;

  public registerBinding(binding: KeybindingBinding): void {
    this.bindings.push(binding);
    this.rebuildTrie();
  }

  public parseKeyString(keyStr: string): KeyChord[] {
    const parts = keyStr.trim().split(/\s+/);
    return parts.map((part) => {
      const keys = part.split('+').map((k) => k.trim().toLowerCase());
      const ctrl = keys.includes('ctrl') || keys.includes('control');
      const meta = keys.includes('cmd') || keys.includes('command') || keys.includes('meta');
      const alt = keys.includes('alt') || keys.includes('option');
      const shift = keys.includes('shift');
      const mainKey = keys.filter((k) => !['ctrl', 'control', 'cmd', 'command', 'meta', 'alt', 'option', 'shift'].includes(k))[0] || '';

      return { ctrl, meta, alt, shift, key: mainKey };
    });
  }

  public chordToKey(chord: KeyChord): string {
    const mods: string[] = [];
    if (chord.ctrl) mods.push('ctrl');
    if (chord.meta) mods.push('meta');
    if (chord.alt) mods.push('alt');
    if (chord.shift) mods.push('shift');
    mods.push(chord.key.toLowerCase());
    return mods.join('+');
  }

  public handleKeyPress(chord: KeyChord, contextStore: ContextKeyStore): string | undefined {
    this.activeChordSequence.push(chord);

    if (this.chordTimer) clearTimeout(this.chordTimer);
    this.chordTimer = setTimeout(() => {
      this.activeChordSequence = [];
    }, this.chordTimeoutMs);

    // Look up in bindings matching current sequence and valid when clause
    const matchedBindings = this.bindings.filter((b) => {
      if (b.chords.length !== this.activeChordSequence.length) return false;
      for (let i = 0; i < b.chords.length; i++) {
        if (this.chordToKey(b.chords[i]) !== this.chordToKey(this.activeChordSequence[i])) {
          return false;
        }
      }
      return WhenExpressionEvaluator.evaluate(b.when, contextStore);
    });

    if (matchedBindings.length > 0) {
      // Sort by specificity descending
      matchedBindings.sort((a, b) => b.specificity - a.specificity);
      this.activeChordSequence = [];
      if (this.chordTimer) clearTimeout(this.chordTimer);
      return matchedBindings[0].commandId;
    }

    // Check if current sequence is a prefix for any binding
    const isPrefix = this.bindings.some((b) => {
      if (b.chords.length <= this.activeChordSequence.length) return false;
      for (let i = 0; i < this.activeChordSequence.length; i++) {
        if (this.chordToKey(b.chords[i]) !== this.chordToKey(this.activeChordSequence[i])) {
          return false;
        }
      }
      return WhenExpressionEvaluator.evaluate(b.when, contextStore);
    });

    if (!isPrefix) {
      this.activeChordSequence = [];
      if (this.chordTimer) clearTimeout(this.chordTimer);
    }

    return undefined;
  }

  public getActiveChordDisplay(): string {
    return this.activeChordSequence.map((c) => this.chordToKey(c)).join(' ');
  }

  private rebuildTrie(): void {
    this.root = { children: new Map() };
    for (const b of this.bindings) {
      let current = this.root;
      for (const chord of b.chords) {
        const key = this.chordToKey(chord);
        let child = current.children.get(key);
        if (!child) {
          child = { children: new Map() };
          current.children.set(key, child);
        }
        current = child;
      }
      current.commandId = b.commandId;
      current.binding = b;
    }
  }
}
