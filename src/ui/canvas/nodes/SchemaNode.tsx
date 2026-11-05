import React from 'react';
import type { CanvasNodeData } from '../types.js';

export const SchemaNode: React.FC<{ data: CanvasNodeData; onSelect?: () => void }> = ({ data, onSelect }) => (
  <div
    onClick={onSelect}
    className="p-3 bg-zinc-900 border border-emerald-500/40 rounded-xl shadow-lg hover:border-emerald-400 cursor-pointer w-56 text-xs font-mono"
  >
    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 mb-2">
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
        SCHEMA
      </span>
      <span className="text-zinc-500 text-[10px] truncate max-w-[100px]">{data.filePath}</span>
    </div>
    <div className="font-semibold text-white truncate">{data.label}</div>
    {data.fields && data.fields.length > 0 && (
      <div className="mt-2 space-y-0.5 text-[10px] text-zinc-400">
        {data.fields.slice(0, 4).map((f) => (
          <div key={f} className="truncate">• {f}</div>
        ))}
        {data.fields.length > 4 && (
          <div className="text-zinc-500">+{data.fields.length - 4} more fields</div>
        )}
      </div>
    )}
  </div>
);
