import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { X, FilePlus, AlertCircle } from 'lucide-react';

export const NewFileModal = ({ isOpen, onClose }) => {
  const { createFile, activeProject } = useProject();
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = filename.trim();
    if (!cleanName) {
      setError('File name cannot be empty');
      return;
    }

    if (activeProject?.files?.some((f) => f.name.toLowerCase() === cleanName.toLowerCase())) {
      setError('A file with this name already exists in the project');
      return;
    }

    try {
      await createFile(cleanName);
      setFilename('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create file');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <FilePlus className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm">New File</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              File Name (with extension)
            </label>
            <input
              type="text"
              autoFocus
              required
              value={filename}
              onChange={(e) => {
                setFilename(e.target.value);
                setError('');
              }}
              placeholder="e.g. data_loader.py, Graph.java, math.cpp"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm font-mono placeholder-slate-400 outline-none transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Supports <span className="font-mono text-slate-700 font-semibold">.py</span>,{' '}
              <span className="font-mono text-slate-700 font-semibold">.java</span>,{' '}
              <span className="font-mono text-slate-700 font-semibold">.cpp</span>,{' '}
              <span className="font-mono text-slate-700 font-semibold">.h</span>,{' '}
              <span className="font-mono text-slate-700 font-semibold">.json</span>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs"
            >
              Create File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFileModal;
