import React, { useState } from 'react';
import type { BlastRadiusReport } from '../../core/impact/types.js';

export interface BlastRadiusBadgeProps {
  report: BlastRadiusReport;
  onTriggerAgentRefactor?: () => void;
}

export const BlastRadiusBadge: React.FC<BlastRadiusBadgeProps> = ({ report, onTriggerAgentRefactor }) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalFiles = report.directConsumers.length + report.transitiveConsumers.length;
  const testCount = report.dependentTests.length;

  const severityColor =
    report.severity === 'CRITICAL_BREAKING'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : report.severity === 'HIGH'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : report.severity === 'MEDIUM'
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  return (
    <div className="relative inline-block text-xs font-mono">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all shadow-sm ${severityColor}`}
      >
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
        <span>Impact: {totalFiles} Files | {testCount} Tests | {report.severity}</span>
        <span className="text-[10px] opacity-70">BRI: {report.blastRadiusIndex}/100</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 text-zinc-300">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
            <span className="font-semibold text-white">Blast Radius Breakdown</span>
            <span className="text-[10px] text-zinc-500">{report.symbolName}</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto text-[11px]">
            {report.isBreakingChange && (
              <div className="p-1.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300">
                ⚠️ Breaking Signature Change: Downstream callers will fail compilation.
              </div>
            )}
            <div className="text-zinc-400 font-medium">Direct Callers ({report.directConsumers.length}):</div>
            {report.directConsumers.map((c, i) => (
              <div key={i} className="pl-2 truncate text-zinc-300">• {c.filePath}</div>
            ))}
            <div className="text-zinc-400 font-medium mt-1">Dependent Tests ({report.dependentTests.length}):</div>
            {report.dependentTests.map((t, i) => (
              <div key={i} className="pl-2 truncate text-amber-300">• {t.filePath}</div>
            ))}
          </div>

          {onTriggerAgentRefactor && (
            <button
              onClick={() => {
                setIsOpen(false);
                onTriggerAgentRefactor();
              }}
              className="w-full mt-3 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
            >
              Have Agent Update Downstream Consumers
            </button>
          )}
        </div>
      )}
    </div>
  );
};
