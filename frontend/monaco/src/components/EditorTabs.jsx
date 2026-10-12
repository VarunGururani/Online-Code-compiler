import React from 'react';
import { useProject } from '../context/ProjectContext';
import { X, FileCode, Terminal, Coffee, Binary, FileText } from 'lucide-react';

const getFileIcon = (filename) => {
  if (filename.endsWith('.py')) return <Terminal className="w-3.5 h-3.5 text-sky-600 shrink-0" />;
  if (filename.endsWith('.java')) return <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
  if (filename.endsWith('.cpp') || filename.endsWith('.cc') || filename.endsWith('.h'))
    return <Binary className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
  if (filename.endsWith('.json') || filename.endsWith('.txt'))
    return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  return <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
};

export const EditorTabs = () => {
  const { openFiles, activeFileId, openFile, closeFile, unsavedFiles } = useProject();

  if (!openFiles || openFiles.length === 0) {
    return (
      <div className="h-9 bg-slate-100/60 border-b border-slate-200 flex items-center px-4 text-xs text-slate-400 italic">
        No open files
      </div>
    );
  }

  return (
    <div className="h-9 bg-slate-100/60 border-b border-slate-200 flex items-center overflow-x-auto select-none no-scrollbar">
      {openFiles.map((file) => {
        const isActive = file.id === activeFileId;
        const isUnsaved = unsavedFiles[file.id];

        return (
          <div
            key={file.id}
            onClick={() => openFile(file)}
            className={`group h-full flex items-center gap-2 px-3.5 border-r border-slate-200 cursor-pointer text-xs font-mono transition-colors relative ${
              isActive
                ? 'bg-white text-slate-900 border-t-2 border-t-blue-600 font-medium'
                : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            {getFileIcon(file.name)}
            <span className="truncate max-w-[140px]">{file.name}</span>

            {/* Unsaved Dot or Close Button */}
            <div className="flex items-center ml-1">
              {isUnsaved ? (
                <span
                  title="Unsaved changes (Ctrl+S to save)"
                  className="w-2 h-2 rounded-full bg-blue-600 group-hover:hidden"
                ></span>
              ) : null}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.id);
                }}
                className={`p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ${
                  isUnsaved ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EditorTabs;
