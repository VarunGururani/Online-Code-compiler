import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { getLanguageById } from '../utils/languages';
import Navbar from '../components/Navbar';
import NewProjectModal from '../components/NewProjectModal';
import {
  FolderPlus,
  Search,
  SlidersHorizontal,
  Clock,
  Play,
  Terminal,
  Coffee,
  Binary,
  Trash2,
  Edit2,
  CheckCircle2,
  Code2,
  FileCode,
} from 'lucide-react';

const langIcons = {
  python: Terminal,
  java: Coffee,
  cpp: Binary,
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const { projects, selectProject, deleteProject, renameProject } = useProject();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Rename modal state
  const [renamingProject, setRenamingProject] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Execution stats calculations
  const totalRuns = useMemo(() => {
    return projects.reduce((acc, p) => acc + (p.runsCount || 0), 0);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects
      .filter((proj) => {
        const matchesSearch =
          proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (proj.description && proj.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesLang = selectedLanguage === 'all' || proj.language === selectedLanguage;
        return matchesSearch && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'runs') return (b.runsCount || 0) - (a.runsCount || 0);
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      });
  }, [projects, searchQuery, selectedLanguage, sortBy]);

  const handleOpenProject = async (proj) => {
    await selectProject(proj.id);
    navigate('/ide');
  };

  const handleStartRename = (proj, e) => {
    e.stopPropagation();
    setRenamingProject(proj);
    setRenameValue(proj.name);
  };

  const handleConfirmRename = async (e) => {
    e.preventDefault();
    if (renamingProject && renameValue.trim()) {
      await renameProject(renamingProject.id, renameValue.trim());
      setRenamingProject(null);
    }
  };

  const handleDelete = async (proj, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete project "${proj.name}"?`)) {
      await deleteProject(proj.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-850 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Welcome & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Developer'}
              </h1>
              <span className="text-xl">👋</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your projects, edit source files, and execute cloud container workloads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>
        </div>

        {/* Telemetry Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Projects</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{projects.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Container Runs</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalRuns}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Success Rate</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">94.8%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg Latency</p>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">395 ms</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Language filter pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['all', 'python', 'java', 'cpp'].map((langKey) => (
              <button
                key={langKey}
                onClick={() => setSelectedLanguage(langKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  selectedLanguage === langKey
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {langKey === 'all' ? 'All Languages' : langKey === 'cpp' ? 'C++' : langKey}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 outline-none text-xs cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="name">Project Name</option>
              <option value="runs">Most Runs</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((proj) => {
              const langInfo = getLanguageById(proj.language);
              const Icon = langIcons[proj.language] || Terminal;
              const fileCount = proj.files?.length || 0;

              return (
                <div
                  key={proj.id}
                  onClick={() => handleOpenProject(proj)}
                  className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top card bar: Language pill & action menu */}
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                        style={{
                          backgroundColor: `${langInfo.color}10`,
                          borderColor: `${langInfo.color}30`,
                          color: langInfo.color,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{langInfo.name}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleStartRename(proj, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Rename Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(proj, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & description */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors truncate">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {proj.description || 'Cloud-native project workspace.'}
                      </p>
                    </div>
                  </div>

                  {/* Card footer: file count, runs count, and last modified */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{proj.runsCount || 0} runs</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(proj.updatedAt || Date.now()).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No projects found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No projects matching "${searchQuery}". Try adjusting your search query.`
                : 'Get started by creating your first cloud coding project.'}
            </p>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm inline-flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        )}
      </main>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />

      {/* Rename Project Modal */}
      {renamingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Rename Project</h3>
            <form onSubmit={handleConfirmRename} className="space-y-4">
              <input
                type="text"
                autoFocus
                required
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRenamingProject(null)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
