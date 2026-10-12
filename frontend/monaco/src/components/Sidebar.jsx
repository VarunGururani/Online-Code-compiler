import React from 'react';
import { useProject } from '../context/ProjectContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Files,
  Terminal,
  History,
  Settings,
  Cpu,
  LayoutDashboard,
} from 'lucide-react';

export const Sidebar = () => {
  const {
    sidebarOpen,
    toggleSidebar,
    outputPanelOpen,
    toggleOutputPanel,
    detailsPanelOpen,
    toggleDetailsPanel,
  } = useProject();

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-12 bg-slate-50/90 border-r border-slate-200 flex flex-col items-center justify-between py-2.5 select-none z-20 shrink-0">
      {/* Top Activity Icons */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Toggle Project Files */}
        <button
          onClick={toggleSidebar}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            sidebarOpen
              ? 'text-blue-600 bg-white border border-slate-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
          }`}
          title="Toggle Explorer (Files)"
        >
          <Files className="w-4 h-4" />
        </button>

        {/* Toggle Output Panel */}
        <button
          onClick={toggleOutputPanel}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            outputPanelOpen
              ? 'text-blue-600 bg-white border border-slate-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
          }`}
          title="Toggle Terminal & Output"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Toggle Docker Container Details */}
        <button
          onClick={toggleDetailsPanel}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            detailsPanelOpen
              ? 'text-blue-600 bg-white border border-slate-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
          }`}
          title="Container Sandbox & Cloud Metrics"
        >
          <Cpu className="w-4 h-4" />
        </button>

        {/* Execution History */}
        <button
          onClick={() => navigate('/history')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            location.pathname === '/history'
              ? 'text-blue-600 bg-white border border-slate-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
          }`}
          title="Execution History Audits"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Dashboard Link */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            location.pathname === '/dashboard'
              ? 'text-blue-600 bg-white border border-slate-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
          }`}
          title="Back to Dashboard"
        >
          <LayoutDashboard className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <button
          onClick={() => navigate('/settings')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            location.pathname === '/settings'
              ? 'text-blue-600 bg-white border border-slate-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
          }`}
          title="Settings & Cloud Config"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
