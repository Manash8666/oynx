export interface CommandDefinition {
  id: string;
  title: string;
  category?: string;
  keybinding?: string; // e.g. "Ctrl+K Ctrl+C" or "Cmd+Shift+P"
  when?: string; // context key expression
  handler: (...args: unknown[]) => unknown | Promise<unknown>;
  icon?: string;
}

export interface KeyChord {
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

export interface KeybindingBinding {
  commandId: string;
  chords: KeyChord[];
  when?: string;
  specificity: number;
}
