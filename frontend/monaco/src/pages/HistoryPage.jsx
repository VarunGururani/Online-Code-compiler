import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { executionService } from '../services/executionService';
import { useProject } from '../context/ProjectContext';
import { getLanguageById } from '../utils/languages';
import Navbar from '../components/Navbar';
import {
  History,
  Search,
  CheckCircle2,
  AlertOctagon,
  Eye,
  Play,
  Terminal,
  Coffee,
  Binary,
  X,
  Copy,
  RotateCw,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const langIcons = {
  python: Terminal,
  java: Coffee,
  cpp: Binary,
};

export const HistoryPage = () => {
  const { selectProject } = useProject();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [inspectedExec, setInspectedExec] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await executionService.getExecutions();
      setExecutions(data);
    } catch (err) {
      toast.error('Failed to load execution history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return executions.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.filename?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLang =
        selectedLanguage === 'all' || item.language === selectedLanguage;

      const matchesStatus =
        selectedStatus === 'all' ||
        item.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesLang && matchesStatus;
    });
  }, [executions, searchQuery, selectedLanguage, selectedStatus]);

  const handleOpenInIDE = async (item) => {
    if (item.projectId) {
      await selectProject(item.projectId);
      navigate('/ide');
    }
  };

  const handleCopyLogs = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Logs copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-850 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Execution History
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Audit log of containerized code executions across Python, Java, and C++ Docker environments.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh Records</span>
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by execution ID, project, or file..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 outline-none text-xs cursor-pointer font-medium"
            >
              <option value="all">All Languages</option>
              <option value="python">Python 3</option>
              <option value="java">Java 17</option>
              <option value="cpp">C++20</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 outline-none text-xs cursor-pointer font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed (0)</option>
              <option value="failed">Failed / Syntax (1)</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Execution ID</th>
                  <th className="py-3 px-4">Project & File</th>
                  <th className="py-3 px-4">Runtime</th>
                  <th className="py-3 px-4">Status & Exit</th>
                  <th className="py-3 px-4">Wall Time</th>
                  <th className="py-3 px-4">RAM</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => {
                  const lang = getLanguageById(item.language);
                  const Icon = langIcons[item.language] || Terminal;
                  const isSuccess = item.status === 'Completed';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors font-mono"
                    >
                      <td className="py-3 px-4 font-semibold text-blue-600">
                        {item.id}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <p className="font-semibold text-slate-800">{item.projectName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.filename}</p>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border"
                          style={{
                            backgroundColor: `${lang.color}10`,
                            borderColor: `${lang.color}30`,
                            color: lang.color,
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{lang.name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium border ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertOctagon className="w-3 h-3 text-rose-600" />
                          )}
                          <span>
                            {item.status} ({item.exitCode})
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {item.durationMs} ms
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {item.memoryMb || 18.4} MB
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 font-sans">
                          <button
                            onClick={() => setInspectedExec(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Inspect stdout & stderr"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenInIDE(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="Open in IDE"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs">
              No execution records match the active filters.
            </div>
          )}
        </div>
      </main>

      {/* Inspect Execution Modal */}
      {inspectedExec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Execution Output: <span className="font-mono text-blue-600">{inspectedExec.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setInspectedExec(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
              {/* Overview grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-sans">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-400">Project</p>
                  <p className="font-semibold text-slate-800 truncate mt-0.5">{inspectedExec.projectName}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-400">Duration</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{inspectedExec.durationMs} ms</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-400">Status</p>
                  <p className={`font-semibold mt-0.5 ${inspectedExec.status === 'Completed' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {inspectedExec.status} ({inspectedExec.exitCode})
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-400">Peak Memory</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{inspectedExec.memoryMb || 18.4} MB</p>
                </div>
              </div>

              {/* Stdout Output */}
              {inspectedExec.stdout && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 font-sans">
                    <span className="text-[11px] font-semibold text-slate-700">Standard Output (stdout)</span>
                    <button
                      onClick={() => handleCopyLogs(inspectedExec.stdout)}
                      className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {inspectedExec.stdout}
                  </pre>
                </div>
              )}

              {/* Stderr Output */}
              {inspectedExec.stderr && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 font-sans">
                    <span className="text-[11px] font-semibold text-rose-700">Standard Error (stderr)</span>
                    <button
                      onClick={() => handleCopyLogs(inspectedExec.stderr)}
                      className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {inspectedExec.stderr}
                  </pre>
                </div>
              )}

              {/* Stdin Input */}
              {inspectedExec.stdin && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 font-sans block mb-1">
                    Standard Input (stdin)
                  </span>
                  <pre className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 whitespace-pre-wrap">
                    {inspectedExec.stdin}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
              <button
                onClick={() => setInspectedExec(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleOpenInIDE(inspectedExec);
                  setInspectedExec(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
              >
                Open Project in IDE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
