import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import Sidebar from '../components/Sidebar';
import ProjectExplorer from '../components/ProjectExplorer';
import EditorTabs from '../components/EditorTabs';
import MonacoEditorContainer from '../components/MonacoEditorContainer';
import OutputPanel from '../components/OutputPanel';
import ExecutionDetailsPanel from '../components/ExecutionDetailsPanel';
import LanguageSelector from '../components/LanguageSelector';
import RunButton from '../components/RunButton';
import {
  Code2,
  Save,
  Palette,
  Terminal,
  Files,
  Cpu,
  Settings,
  Edit2,
  Check,
} from 'lucide-react';

export const IDEPage = () => {
  const { projectId } = useParams();
  const {
    activeProject,
    selectProject,
    projects,
    saveActiveFile,
    unsavedFiles,
    activeFileId,
    editorTheme,
    setEditorTheme,
    sidebarOpen,
    toggleSidebar,
    outputPanelOpen,
    toggleOutputPanel,
    detailsPanelOpen,
    toggleDetailsPanel,
    renameProject,
  } = useProject();

  const [isRenaming, setIsRenaming] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');

  useEffect(() => {
    if (projectId && projects.length > 0) {
      if (activeProject?.id !== projectId) {
        selectProject(projectId);
      }
    }
  }, [projectId, projects]);

  useEffect(() => {
    if (activeProject) {
      setProjectTitle(activeProject.name);
    }
  }, [activeProject]);

  const hasUnsavedChanges = activeFileId ? unsavedFiles[activeFileId] : false;

  const handleSaveRename = (e) => {
    e.preventDefault();
    if (activeProject && projectTitle.trim()) {
      renameProject(activeProject.id, projectTitle.trim());
      setIsRenaming(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden select-none text-slate-850">
      {/* 1. Top IDE Toolbar */}
      <header className="h-11 bg-white border-b border-slate-200 flex items-center justify-between px-3 z-30 shrink-0 shadow-xs">
        {/* Left: Project title & Language */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Return to Projects Dashboard"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs tracking-tight text-slate-900 hidden sm:inline">
              Cloud<span className="text-blue-600">IDE</span>
            </span>
          </Link>

          <span className="text-slate-200">|</span>

          {/* Project Name (Editable) */}
          {activeProject && (
            <div className="flex items-center gap-1.5">
              {isRenaming ? (
                <form onSubmit={handleSaveRename} className="flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    onBlur={() => setIsRenaming(false)}
                    className="bg-slate-50 border border-blue-500 rounded px-2 py-0.5 text-xs text-slate-900 outline-none"
                  />
                  <button type="submit" className="p-1 text-emerald-600 hover:text-emerald-700">
                    <Check className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsRenaming(true)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
                  title="Click to rename project"
                >
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">
                    {activeProject.name}
                  </span>
                  <Edit2 className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />
                </button>
              )}
            </div>
          )}

          {/* Language Selector */}
          <LanguageSelector />
        </div>

        {/* Center: Save & Run Controls */}
        <div className="flex items-center gap-2">
          {/* Save Button */}
          <button
            onClick={saveActiveFile}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200'
            }`}
            title="Save Active File (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
            {hasUnsavedChanges && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            )}
          </button>

          {/* Run Button */}
          <RunButton />
        </div>

        {/* Right: Theme Selector, Layout toggles & Navigation */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/80 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={editorTheme}
              onChange={(e) => setEditorTheme(e.target.value)}
              className="bg-transparent text-slate-700 outline-none text-xs cursor-pointer font-medium"
              title="Editor Theme"
            >
              <option value="vs-light" className="bg-white">VS Light (Default)</option>
              <option value="vs-dark" className="bg-white">VS Dark</option>
              <option value="hc-black" className="bg-white">High Contrast</option>
            </select>
          </div>

          {/* Layout Quick Toggles */}
          <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={toggleSidebar}
              className={`p-1 rounded-md text-xs transition-colors ${
                sidebarOpen ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Toggle Explorer"
            >
              <Files className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleOutputPanel}
              className={`p-1 rounded-md text-xs transition-colors ${
                outputPanelOpen ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Toggle Output Drawer"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleDetailsPanel}
              className={`p-1 rounded-md text-xs transition-colors ${
                detailsPanelOpen ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Toggle Container Telemetry"
            >
              <Cpu className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            to="/settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="IDE Preferences & API Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* 2. Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Activity Sidebar */}
        <Sidebar />

        {/* Collapsible Project Explorer */}
        {sidebarOpen && (
          <aside className="w-60 h-full border-r border-slate-200 shrink-0">
            <ProjectExplorer />
          </aside>
        )}

        {/* Central Editor & Bottom Output Drawer */}
        <section className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
          {/* File Tabs */}
          <EditorTabs />

          {/* Monaco Code Editor */}
          <div className="flex-1 w-full overflow-hidden relative">
            <MonacoEditorContainer />
          </div>

          {/* Output & Terminal Bottom Panel */}
          <OutputPanel />
        </section>

        {/* Collapsible Container & Execution Details Panel */}
        <ExecutionDetailsPanel />
      </div>
    </div>
  );
};

export default IDEPage;
