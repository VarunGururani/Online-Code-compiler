import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { SUPPORTED_LANGUAGES, getLanguageById } from '../utils/languages';
import { Terminal, Coffee, Binary, ChevronDown, Check } from 'lucide-react';

const langIcons = {
  python: Terminal,
  java: Coffee,
  cpp: Binary,
};

export const LanguageSelector = () => {
  const { activeProject, changeLanguage } = useProject();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangId = activeProject?.language || 'python';
  const currentLang = getLanguageById(currentLangId);
  const CurrentIcon = langIcons[currentLang.id] || Terminal;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-xs font-medium text-slate-800 transition-colors shadow-xs"
        aria-label="Select execution runtime"
      >
        <CurrentIcon className="w-3.5 h-3.5 shrink-0" style={{ color: currentLang.color }} />
        <span>{currentLang.name}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 mt-1.5 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3.5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Select Runtime
            </div>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const Icon = langIcons[lang.id] || Terminal;
              const isSelected = lang.id === currentLangId;
              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    changeLanguage(lang.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" style={{ color: lang.color }} />
                    <div className="text-left">
                      <p className="leading-tight">{lang.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{lang.version}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
