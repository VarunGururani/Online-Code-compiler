import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Folder,
  FolderOpen,
  FileCode,
  FilePlus,
  FolderPlus,
  RefreshCw,
  Trash2,
  Edit2,
  Terminal,
  Coffee,
  Binary,
  FileText,
  ChevronRight,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import NewFileModal from './NewFileModal';

const getFileIcon = (filename) => {
  if (filename.endsWith('.py')) return <Terminal className="w-4 h-4 text-sky-600 shrink-0" />;
  if (filename.endsWith('.java')) return <Coffee className="w-4 h-4 text-amber-600 shrink-0" />;
  if (filename.endsWith('.cpp') || filename.endsWith('.cc') || filename.endsWith('.h'))
    return <Binary className="w-4 h-4 text-blue-600 shrink-0" />;
  if (filename.endsWith('.json') || filename.endsWith('.txt'))
    return <FileText className="w-4 h-4 text-slate-500 shrink-0" />;
  return <FileCode className="w-4 h-4 text-slate-500 shrink-0" />;
};

export const ProjectExplorer = () => {
  const {
    activeProject,
    openFile,
    activeFileId,
    deleteFile,
    renameFile,
    unsavedFiles,
    loadProjects,
  } = useProject();

  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [editingFileId, setEditingFileId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isFolderExpanded, setIsFolderExpanded] = useState(true);

  if (!activeProject) {
    return (
      <div className="p-4 text-xs text-slate-400 text-center">
        No active project selected.
      </div>
    );
  }

  const files = activeProject.files || [];

  const handleStartRename = (file, e) => {
    e.stopPropagation();
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  const handleSaveRename = (fileId, e) => {
    e.stopPropagation();
    if (editingName.trim()) {
      renameFile(fileId, editingName.trim());
    }
    setEditingFileId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingFileId(null);
  };

  const handleDelete = (fileId, fileName, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      deleteFile(fileId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/60 select-none text-xs border-r border-slate-200">
      {/* Explorer Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-slate-200/80 text-slate-500">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
          Explorer
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsNewFileModalOpen(true)}
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-800 text-slate-500 transition-colors"
            title="New File"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFolderExpanded((p) => !p)}
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-800 text-slate-500 transition-colors"
            title="Toggle Folders"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => loadProjects()}
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-800 text-slate-500 transition-colors"
            title="Refresh Files"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tree Section */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Project Root Folder node */}
        <div className="mb-1">
          <button
            onClick={() => setIsFolderExpanded((p) => !p)}
            className="w-full flex items-center gap-1.5 px-3 py-1 text-slate-700 hover:bg-slate-100 text-left transition-colors font-medium text-xs"
          >
            {isFolderExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            {isFolderExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span className="truncate">{activeProject.name}</span>
            <span className="text-[10px] text-slate-400 ml-auto font-mono">
              ({files.length})
            </span>
          </button>

          {/* Children Files */}
          {isFolderExpanded && (
            <div className="pl-4 mt-0.5 space-y-0.5">
              {files.map((file) => {
                const isActive = file.id === activeFileId;
                const isUnsaved = unsavedFiles[file.id];
                const isEditing = editingFileId === file.id;

                return (
                  <div
                    key={file.id}
                    onClick={() => !isEditing && openFile(file)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-50/90 text-blue-700 font-medium border-l-2 border-l-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 mr-1">
                      {getFileIcon(file.name)}

                      {isEditing ? (
                        <div
                          className="flex items-center gap-1 flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(file.id, e);
                              if (e.key === 'Escape') handleCancelRename(e);
                            }}
                            className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-900 outline-none font-mono"
                          />
                          <button
                            onClick={(e) => handleSaveRename(file.id, e)}
                            className="p-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={handleCancelRename}
                            className="p-1 text-rose-600 hover:text-rose-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="truncate font-mono">{file.name}</span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        {isUnsaved && (
                          <span
                            className="w-2 h-2 rounded-full bg-blue-500 group-hover:hidden"
                            title="Unsaved changes"
                          ></span>
                        )}

                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button
                            onClick={(e) => handleStartRename(file, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 transition-colors"
                            title="Rename File"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(file.id, file.name, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200/60 transition-colors"
                            title="Delete File"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {files.length === 0 && (
                <div className="py-2 text-[11px] text-slate-400 italic pl-2">
                  No files yet. Click (+) to add one.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New File Modal */}
      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
      />
    </div>
  );
};

export default ProjectExplorer;
