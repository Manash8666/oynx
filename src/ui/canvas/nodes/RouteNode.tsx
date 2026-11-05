import React from 'react';
import type { CanvasNodeData } from '../types.js';

export const RouteNode: React.FC<{ data: CanvasNodeData; onSelect?: () => void }> = ({ data, onSelect }) => (
  <div
    onClick={onSelect}
    className="p-3 bg-zinc-900 border border-blue-500/40 rounded-xl shadow-lg hover:border-blue-400 cursor-pointer w-56 text-xs font-mono"
  >
    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 mb-2">
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
        ENDPOINT
      </span>
      <span className="text-zinc-500 text-[10px] truncate max-w-[100px]">{data.filePath}</span>
    </div>
    <div className="font-semibold text-white truncate">{data.label}</div>
    {data.methods && (
      <div className="flex gap-1 mt-2">
        {data.methods.map((m) => (
          <span key={m} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300">
            {m}
          </span>
        ))}
      </div>
    )}
  </div>
);
