import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Play, Square, Loader2 } from 'lucide-react';

export const RunButton = () => {
  const { executionState, runActiveCode, stopExecution } = useProject();

  const isRunning =
    executionState === 'Queued' ||
    executionState === 'Compiling' ||
    executionState === 'Running';

  if (isRunning) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={stopExecution}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          title="Stop current execution"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-amber-700">
          <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
          <span>{executionState}...</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={runActiveCode}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer group"
      title="Run active file in container (Ctrl+Enter)"
    >
      <Play className="w-3.5 h-3.5 fill-current group-hover:translate-x-0.5 transition-transform" />
      <span>Run</span>
      <kbd className="hidden md:inline-block text-[10px] bg-emerald-700/50 px-1 py-0.5 rounded text-emerald-100 font-mono">
        Ctrl+↵
      </kbd>
    </button>
  );
};

export default RunButton;
