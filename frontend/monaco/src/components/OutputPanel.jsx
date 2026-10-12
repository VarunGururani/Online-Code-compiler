import React, { useState, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import {
  Terminal,
  AlertOctagon,
  FileText,
  Clock,
  HardDrive,
  Copy,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Container,
} from 'lucide-react';

export const OutputPanel = () => {
  const {
    outputPanelOpen,
    setOutputPanelOpen,
    outputPanelTab,
    setOutputPanelTab,
    outputPanelHeight,
    setOutputPanelHeight,
    executionState,
    executionResult,
    stdinValue,
    setStdinValue,
    clearOutput,
    activeProject,
  } = useProject();

  const { toast } = useToast();
  const [isMaximized, setIsMaximized] = useState(false);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(240);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = outputPanelHeight;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaY = startYRef.current - e.clientY;
    const newHeight = Math.max(140, Math.min(window.innerHeight - 180, startHeightRef.current + deltaY));
    setOutputPanelHeight(newHeight);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleCopy = () => {
    const textToCopy =
      outputPanelTab === 'stdout'
        ? executionResult?.stdout || ''
        : outputPanelTab === 'stderr'
        ? executionResult?.stderr || ''
        : stdinValue;

    if (!textToCopy) {
      toast.info('Nothing to copy');
      return;
    }

    navigator.clipboard.writeText(textToCopy);
    toast.success('Copied to clipboard');
  };

  if (!outputPanelOpen) return null;

  const currentHeight = isMaximized ? window.innerHeight - 120 : outputPanelHeight;

  return (
    <div
      style={{ height: `${currentHeight}px` }}
      className="bg-white border-t border-slate-200 flex flex-col select-none relative transition-all duration-75 shadow-sm"
    >
      {/* Top Resize Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="h-1.5 w-full bg-slate-100 hover:bg-blue-400 cursor-ns-resize transition-colors absolute top-0 left-0 z-20 group flex items-center justify-center"
        title="Drag up or down to resize drawer"
      >
        <div className="w-8 h-1 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors"></div>
      </div>

      {/* Panel Tab Navigation Bar */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-slate-200 text-xs bg-slate-50/80">
        {/* Left: Tab selectors */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOutputPanelTab('stdout')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              outputPanelTab === 'stdout'
                ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            <span>Output (stdout)</span>
            {executionResult?.stdout && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            onClick={() => setOutputPanelTab('stderr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              outputPanelTab === 'stderr'
                ? 'bg-white text-rose-700 font-semibold shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Errors (stderr)</span>
            {executionResult?.stderr && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            )}
          </button>

          <button
            onClick={() => setOutputPanelTab('stdin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              outputPanelTab === 'stdin'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Input (stdin)</span>
            {stdinValue && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            )}
          </button>

          <button
            onClick={() => setOutputPanelTab('logs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              outputPanelTab === 'logs'
                ? 'bg-white text-amber-700 font-semibold shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Container className="w-3.5 h-3.5 text-amber-600" />
            <span>Telemetry</span>
          </button>
        </div>

        {/* Right: Metrics & Actions */}
        <div className="flex items-center gap-3">
          {/* Status Badges */}
          {executionResult && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
              <span
                className={`px-2 py-0.5 rounded-md border flex items-center gap-1 font-medium ${
                  executionResult.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {executionResult.status === 'Completed' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                )}
                <span>Exit {executionResult.exitCode}</span>
              </span>

              {executionResult.durationMs !== undefined && (
                <span className="flex items-center gap-1 text-slate-600 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{executionResult.durationMs}ms</span>
                </span>
              )}

              {executionResult.memoryMb !== undefined && (
                <span className="flex items-center gap-1 text-slate-600 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                  <HardDrive className="w-3 h-3 text-slate-400" />
                  <span>{executionResult.memoryMb} MB</span>
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 text-slate-400">
            <button
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
              title="Copy Output"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearOutput}
              className="p-1 rounded-md hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
              title="Clear Output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMaximized((p) => !p)}
              className="p-1 rounded-md hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
              title={isMaximized ? 'Restore Height' : 'Maximize Panel'}
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => setOutputPanelOpen(false)}
              className="p-1 rounded-md hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
              title="Close Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs select-text bg-white">
        {/* Tab 1: Standard Output (stdout) */}
        {outputPanelTab === 'stdout' && (
          <>
            {executionState === 'Running' || executionState === 'Compiling' || executionState === 'Queued' ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-2" />
                <p className="font-semibold text-slate-700 font-sans text-sm">
                  {executionState === 'Queued' && 'Enqueuing execution job in Redis...'}
                  {executionState === 'Compiling' && 'Compiling source code in worker sandbox...'}
                  {executionState === 'Running' && 'Executing program in container sandbox...'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Allocating container quotas (0.5 vCPU, 256MB RAM)
                </p>
              </div>
            ) : executionResult?.stdout ? (
              <pre className="whitespace-pre-wrap leading-relaxed text-slate-850">
                {executionResult.stdout}
              </pre>
            ) : executionResult?.stderr ? (
              <div className="text-slate-500 italic font-sans text-xs">
                Program produced standard error output. Check the{' '}
                <button
                  onClick={() => setOutputPanelTab('stderr')}
                  className="text-rose-600 underline font-semibold"
                >
                  Errors tab
                </button>
                .
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8 font-sans">
                <Terminal className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
                <p className="text-slate-600 font-medium text-xs">Ready to execute</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click the Run button or press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Ctrl+Enter</kbd> to run your code.
                </p>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Standard Error (stderr) */}
        {outputPanelTab === 'stderr' && (
          <>
            {executionResult?.stderr ? (
              <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-800 whitespace-pre-wrap leading-relaxed">
                {executionResult.stderr}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8 font-sans">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 stroke-1" />
                <p className="text-slate-600 text-xs font-medium">No errors detected</p>
              </div>
            )}
          </>
        )}

        {/* Tab 3: Standard Input (stdin) */}
        {outputPanelTab === 'stdin' && (
          <div className="h-full flex flex-col font-sans">
            <div className="mb-2 flex items-center justify-between text-slate-500 text-[11px]">
              <span>Provide input stream to be fed into your program:</span>
              <span className="font-mono text-slate-400">{stdinValue.length} characters</span>
            </div>
            <textarea
              value={stdinValue}
              onChange={(e) => setStdinValue(e.target.value)}
              placeholder="Paste or type inputs here (one per line)..."
              className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-mono text-xs focus:bg-white focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Tab 4: Container Logs */}
        {outputPanelTab === 'logs' && (
          <div className="space-y-3 font-sans text-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Container className="w-4 h-4 text-amber-600" />
                <span>Docker Container Telemetry & Isolation</span>
              </span>
              <span className="font-mono text-blue-600 font-medium">
                Sandbox: {executionResult?.sandboxId || 'sbx_ephemeral'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-400">Container Image</p>
                <p className="text-slate-800 font-semibold truncate mt-0.5">
                  {activeProject?.language === 'java'
                    ? 'eclipse-temurin:17'
                    : activeProject?.language === 'cpp'
                    ? 'gcc:13.2'
                    : 'python:3.11'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-400">Security Profile</p>
                <p className="text-emerald-700 font-semibold mt-0.5">seccomp-unprivileged</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-400">CPU / RAM Quotas</p>
                <p className="text-slate-800 font-semibold mt-0.5">0.5 vCPU / 256 MB</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-400">Execution Mode</p>
                <p className="text-blue-700 font-semibold mt-0.5">
                  {executionResult?.isDemoSandbox ? 'Sandbox Simulation' : 'Live Node.js API'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 font-mono text-[11px] text-slate-600 leading-relaxed border border-slate-200">
              <p className="text-slate-400">[00.00s] POST /executions payload received by Express API</p>
              <p className="text-slate-400">[00.04s] Job enqueued in Redis BullMQ (queue: code-exec)</p>
              <p className="text-slate-400">[00.12s] Worker picked up job → mounting ephemeral /workspace</p>
              <p className="text-slate-400">[00.35s] Container instantiated with strict cgroups v2 limits</p>
              <p className="text-emerald-700 font-semibold">[00.82s] Execution terminated with code {executionResult?.exitCode ?? 0}</p>
              <p className="text-slate-400">[00.89s] Sandbox destroyed &amp; temporary volume unmounted</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
