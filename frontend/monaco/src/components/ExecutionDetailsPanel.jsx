import React from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Container,
  Cpu,
  HardDrive,
  ShieldCheck,
  Clock,
  Layers,
  X,
} from 'lucide-react';
import { getLanguageById } from '../utils/languages';

export const ExecutionDetailsPanel = () => {
  const { detailsPanelOpen, setDetailsPanelOpen, activeProject, executionResult, executionState } =
    useProject();

  if (!detailsPanelOpen) return null;

  const currentLang = getLanguageById(activeProject?.language || 'python');

  return (
    <aside className="w-72 bg-slate-50/70 border-l border-slate-200 flex flex-col select-none text-xs z-10 shrink-0">
      {/* Header */}
      <div className="h-9 px-3.5 flex items-center justify-between border-b border-slate-200 text-slate-700 bg-white">
        <div className="flex items-center gap-2">
          <Container className="w-4 h-4 text-amber-600" />
          <span className="font-semibold text-xs text-slate-800">Sandbox Environment</span>
        </div>
        <button
          onClick={() => setDetailsPanelOpen(false)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Runtime info */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Container Image
          </h4>
          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Image Tag</p>
              <p className="font-mono text-slate-800 font-semibold truncate text-[11px]">
                {currentLang.dockerImage}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 text-[11px]">
              <div>
                <p className="text-[10px] text-slate-400">Runtime</p>
                <p className="font-medium text-slate-700">{currentLang.version}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Arch</p>
                <p className="font-medium text-slate-700">linux/amd64</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Sandbox Limits */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Cgroup Limits
          </h4>
          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 text-[11px] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" /> CPU Allocation
              </span>
              <span className="font-mono text-slate-800 font-medium">0.5 vCPU</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-600" /> RAM Ceiling
              </span>
              <span className="font-mono text-slate-800 font-medium">256 MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Timeout Limit
              </span>
              <span className="font-mono text-slate-800 font-medium">10.0s</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Outbound Net
              </span>
              <span className="font-mono text-rose-600 font-medium">Disabled</span>
            </div>
          </div>
        </div>

        {/* Execution Health Status */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Active Telemetry
          </h4>
          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 text-[11px] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status</span>
              <span
                className={`font-mono font-semibold px-2 py-0.5 rounded text-[10px] ${
                  executionState === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : executionState === 'Failed'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {executionState}
              </span>
            </div>

            {executionResult && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Wall Time</span>
                  <span className="font-mono text-slate-800">{executionResult.durationMs} ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Peak Memory</span>
                  <span className="font-mono text-slate-800">{executionResult.memoryMb} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Sandbox ID</span>
                  <span className="font-mono text-blue-600 truncate max-w-[120px]">
                    {executionResult.sandboxId || 'sbx_e8910'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cloud Infra Target Callout */}
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Cloud Architecture
          </p>
          <p className="text-slate-600 leading-relaxed text-[10px]">
            In production, execution payloads flow from AWS ALB to Kubernetes (EKS) worker pods that run unprivileged gVisor Docker containers.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ExecutionDetailsPanel;
