import React, { useState } from 'react';
import type { CanvasEdgeData, CanvasNodeData } from './types.js';
import { RouteNode } from './nodes/RouteNode.js';
import { SchemaNode } from './nodes/SchemaNode.js';
import { ComponentNode } from './nodes/ComponentNode.js';

export interface CanvasWorkspaceProps {
  nodes: CanvasNodeData[];
  edges: CanvasEdgeData[];
  onNodeClick?: (node: CanvasNodeData) => void;
  onEdgeConnect?: (sourceId: string, targetId: string) => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  nodes,
  edges,
  onNodeClick,
  onEdgeConnect,
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mode, setMode] = useState<'canvas' | 'split'>('canvas');

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg shadow-xl backdrop-blur-md">
        <button
          onClick={() => setMode(mode === 'canvas' ? 'split' : 'canvas')}
          className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          {mode === 'canvas' ? 'Split View' : 'Full Canvas'}
        </button>
        <div className="h-4 w-px bg-zinc-700" />
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
          className="px-2 py-1 rounded hover:bg-zinc-800 text-xs text-zinc-300"
        >
          +
        </button>
        <span className="text-[10px] text-zinc-400 font-mono">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
          className="px-2 py-1 rounded hover:bg-zinc-800 text-xs text-zinc-300"
        >
          -
        </button>
        <button
          onClick={() => {
            setZoom(1.0);
            setPan({ x: 0, y: 0 });
          }}
          className="px-2 py-1 rounded hover:bg-zinc-800 text-xs text-zinc-400"
        >
          Reset
        </button>
      </div>

      {/* Node and Wire Canvas Surface */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none">
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const x1 = sourceNode.position.x + 224; // right edge of node (w-56)
            const y1 = sourceNode.position.y + 35;
            const x2 = targetNode.position.x;
            const y2 = targetNode.position.y + 35;
            const dx = Math.abs(x2 - x1) * 0.5;

            const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            return (
              <g key={edge.id}>
                <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 2" />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 5}
                    fill="#a5b4fc"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: `${node.position.x}px`,
              top: `${node.position.y}px`,
            }}
          >
            {node.type === 'route' && (
              <RouteNode
                data={node}
                onSelect={() => {
                  setSelectedNodeId(node.id);
                  onNodeClick?.(node);
                }}
              />
            )}
            {node.type === 'schema' && (
              <SchemaNode
                data={node}
                onSelect={() => {
                  setSelectedNodeId(node.id);
                  onNodeClick?.(node);
                }}
              />
            )}
            {node.type === 'component' && (
              <ComponentNode
                data={node}
                onSelect={() => {
                  setSelectedNodeId(node.id);
                  onNodeClick?.(node);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
