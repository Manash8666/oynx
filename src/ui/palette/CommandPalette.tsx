import React, { useState, useEffect } from 'react';
import type { CommandDefinition } from '../../core/commands/types.js';
import type { CommandRegistry } from '../../core/commands/registry.js';

export interface CommandPaletteProps {
  registry: CommandRegistry;
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ registry, isOpen, onClose }) => {
  const [query, setQuery] = useState('>');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const mode = query.startsWith('>')
    ? 'commands'
    : query.startsWith('@')
    ? 'symbols'
    : query.startsWith(':')
    ? 'lines'
    : 'all';

  const filterTerm = query.replace(/^([>@:?])\s*/, '');
  const commands = mode === 'commands' ? registry.getRankedCommands(filterTerm) : registry.getRankedCommands(query);

  const handleSelect = async (cmd: CommandDefinition) => {
    onClose();
    await registry.executeCommand(cmd.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
            {mode.toUpperCase()}
          </span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(commands.length - 1, prev + 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(0, prev - 1));
              }
              if (e.key === 'Enter' && commands[selectedIndex]) {
                handleSelect(commands[selectedIndex]);
              }
            }}
            placeholder="Type a command or '>' to filter..."
            className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder-zinc-500 font-mono"
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-1 divide-y divide-zinc-800/40">
          {commands.map((cmd, idx) => (
            <div
              key={cmd.id}
              onClick={() => handleSelect(cmd)}
              className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                idx === selectedIndex ? 'bg-indigo-600/30 text-indigo-300' : 'text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{cmd.title}</span>
                {cmd.category && <span className="text-[10px] text-zinc-500">{cmd.category}</span>}
              </div>
              {cmd.keybinding && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  {cmd.keybinding}
                </span>
              )}
            </div>
          ))}
          {commands.length === 0 && (
            <div className="p-4 text-center text-xs text-zinc-500">No matching commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
