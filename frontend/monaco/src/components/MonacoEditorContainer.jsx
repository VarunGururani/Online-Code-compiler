import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useProject } from '../context/ProjectContext';
import { getLanguageByFilename } from '../utils/languages';
import { Loader2 } from 'lucide-react';

export const MonacoEditorContainer = () => {
  const {
    activeFile,
    activeContent,
    updateFileContent,
    saveActiveFile,
    runActiveCode,
    editorTheme,
    editorSettings,
  } = useProject();

  const editorRef = useRef(null);

  const monacoLang = activeFile
    ? getLanguageByFilename(activeFile.name).monacoLanguage
    : 'plaintext';

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add Save command (Ctrl+S / Cmd+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveActiveFile();
    });

    // Add Run command (Ctrl+Enter / Cmd+Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runActiveCode();
    });
  };

  const handleChange = (value) => {
    if (activeFile) {
      updateFileContent(activeFile.id, value || '');
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center text-slate-400 select-none">
        <p className="text-sm font-medium text-slate-600">No file selected</p>
        <p className="text-xs text-slate-400 mt-1">Select or create a file in the Project Explorer</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
      <Editor
        key={activeFile.id}
        height="100%"
        width="100%"
        language={monacoLang}
        theme={editorTheme || 'vs-light'}
        value={activeContent}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full bg-white text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs font-mono">Initializing editor buffer...</span>
          </div>
        }
        options={{
          automaticLayout: true,
          fontSize: editorSettings.fontSize || 14,
          tabSize: editorSettings.tabSize || 4,
          wordWrap: editorSettings.wordWrap || 'on',
          minimap: {
            enabled: editorSettings.minimap ?? true,
          },
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          bracketPairColorization: {
            enabled: true,
          },
          formatOnPaste: true,
          formatOnType: true,
          renderLineHighlight: 'all',
          padding: {
            top: 10,
            bottom: 10,
          },
        }}
      />
    </div>
  );
};

export default MonacoEditorContainer;
