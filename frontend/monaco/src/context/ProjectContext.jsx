import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import { executionService } from '../services/executionService';
import { useToast } from './ToastContext';
import { getLanguageByFilename, getLanguageById, SUPPORTED_LANGUAGES } from '../utils/languages';
import { getStarterTemplate } from '../utils/starterTemplates';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { toast } = useToast();

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Editor and Workspace State
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [unsavedFiles, setUnsavedFiles] = useState({});

  // Editor Settings
  const [editorTheme, setEditorTheme] = useState('vs-light');
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 4,
    wordWrap: 'on',
    minimap: true,
  });

  // Panels layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [outputPanelOpen, setOutputPanelOpen] = useState(true);
  const [outputPanelTab, setOutputPanelTab] = useState('stdout'); // 'stdout', 'stderr', 'stdin', 'logs'
  const [outputPanelHeight, setOutputPanelHeight] = useState(240);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);

  // Execution State
  const [executionState, setExecutionState] = useState('Idle'); // Idle, Queued, Compiling, Running, Completed, Failed, Timed Out
  const [executionResult, setExecutionResult] = useState(null);
  const [stdinValue, setStdinValue] = useState('');
  const [executionsHistory, setExecutionsHistory] = useState([]);

  // Fetch projects on initial mount
  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
      if (!activeProject && data.length > 0) {
        selectProjectInternal(data[0]);
      }
    } catch (err) {
      toast.error(`Failed to load projects: ${err.message}`);
    } finally {
      setLoadingProjects(false);
    }
  }, [activeProject, toast]);

  useEffect(() => {
    loadProjects();
  }, []);

  // Internal helper to set active project and its initial open file
  const selectProjectInternal = (proj) => {
    setActiveProject(proj);
    if (proj.files && proj.files.length > 0) {
      const mainFile = proj.files[0];
      setOpenFiles([mainFile]);
      setActiveFileId(mainFile.id);
      setFileContents({ [mainFile.id]: mainFile.content || '' });
      setUnsavedFiles({});
    } else {
      setOpenFiles([]);
      setActiveFileId(null);
      setFileContents({});
      setUnsavedFiles({});
    }
  };

  const selectProject = async (projectId) => {
    try {
      const proj = await projectService.getProject(projectId);
      selectProjectInternal(proj);
    } catch (err) {
      toast.error(`Error opening project: ${err.message}`);
    }
  };

  const createProject = async ({ name, description, language }) => {
    try {
      const newProj = await projectService.createProject({ name, description, language });
      setProjects((prev) => [newProj, ...prev]);
      selectProjectInternal(newProj);
      toast.success(`Project "${newProj.name}" created!`);
      return newProj;
    } catch (err) {
      toast.error(`Failed to create project: ${err.message}`);
      throw err;
    }
  };

  const renameProject = async (projectId, newName) => {
    try {
      const updated = await projectService.updateProject(projectId, { name: newName });
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
      if (activeProject?.id === projectId) {
        setActiveProject(updated);
      }
      toast.success('Project renamed successfully');
    } catch (err) {
      toast.error(`Failed to rename project: ${err.message}`);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (activeProject?.id === projectId) {
        const remaining = projects.filter((p) => p.id !== projectId);
        if (remaining.length > 0) {
          selectProjectInternal(remaining[0]);
        } else {
          setActiveProject(null);
          setOpenFiles([]);
          setActiveFileId(null);
        }
      }
      toast.success('Project deleted');
    } catch (err) {
      toast.error(`Failed to delete project: ${err.message}`);
    }
  };

  // File Operations
  const openFile = (file) => {
    if (!openFiles.some((f) => f.id === file.id)) {
      setOpenFiles((prev) => [...prev, file]);
    }
    setActiveFileId(file.id);
    if (fileContents[file.id] === undefined) {
      setFileContents((prev) => ({ ...prev, [file.id]: file.content || '' }));
    }
  };

  const closeFile = (fileId) => {
    const updated = openFiles.filter((f) => f.id !== fileId);
    setOpenFiles(updated);

    if (activeFileId === fileId) {
      if (updated.length > 0) {
        setActiveFileId(updated[updated.length - 1].id);
      } else {
        setActiveFileId(null);
      }
    }
  };

  const updateFileContent = (fileId, content) => {
    setFileContents((prev) => ({ ...prev, [fileId]: content }));
    const originalFile = activeProject?.files?.find((f) => f.id === fileId);
    const hasChanged = originalFile ? originalFile.content !== content : true;
    setUnsavedFiles((prev) => ({ ...prev, [fileId]: hasChanged }));
  };

  const saveActiveFile = async () => {
    if (!activeProject || !activeFileId) return;
    const content = fileContents[activeFileId] ?? '';
    try {
      await projectService.updateFile(activeProject.id, activeFileId, { content });
      setUnsavedFiles((prev) => ({ ...prev, [activeFileId]: false }));

      // Update activeProject file list
      setActiveProject((prev) => ({
        ...prev,
        files: prev.files.map((f) => (f.id === activeFileId ? { ...f, content } : f)),
      }));

      toast.success('File saved successfully');
    } catch (err) {
      toast.error(`Failed to save file: ${err.message}`);
    }
  };

  const saveAllFiles = async () => {
    if (!activeProject) return;
    const unsavedIds = Object.keys(unsavedFiles).filter((id) => unsavedFiles[id]);
    for (const fileId of unsavedIds) {
      const content = fileContents[fileId] ?? '';
      try {
        await projectService.updateFile(activeProject.id, fileId, { content });
      } catch (err) {
        console.error('Error saving file', fileId, err);
      }
    }
    setUnsavedFiles({});
    toast.success('All files saved');
  };

  const createFile = async (name) => {
    if (!activeProject) return;
    try {
      const lang = getLanguageByFilename(name);
      const starter = getStarterTemplate(lang.id);
      const content = starter && starter.filename === name ? starter.content : `// ${name}\n`;
      const newFile = await projectService.createFile(activeProject.id, { name, content });

      setActiveProject((prev) => ({
        ...prev,
        files: [...(prev.files || []), newFile],
      }));

      openFile(newFile);
      toast.success(`Created file ${name}`);
    } catch (err) {
      toast.error(`Failed to create file: ${err.message}`);
    }
  };

  const deleteFile = async (fileId) => {
    if (!activeProject) return;
    try {
      await projectService.deleteFile(activeProject.id, fileId);
      closeFile(fileId);
      setActiveProject((prev) => ({
        ...prev,
        files: prev.files.filter((f) => f.id !== fileId),
      }));
      toast.success('File deleted');
    } catch (err) {
      toast.error(`Failed to delete file: ${err.message}`);
    }
  };

  const renameFile = async (fileId, newName) => {
    if (!activeProject) return;
    try {
      const updated = await projectService.updateFile(activeProject.id, fileId, { name: newName });
      setActiveProject((prev) => ({
        ...prev,
        files: prev.files.map((f) => (f.id === fileId ? updated : f)),
      }));
      setOpenFiles((prev) => prev.map((f) => (f.id === fileId ? updated : f)));
      toast.success('File renamed');
    } catch (err) {
      toast.error(`Failed to rename file: ${err.message}`);
    }
  };

  // Change project language and optionally supply starter template
  const changeLanguage = (langId) => {
    if (!activeProject) return;
    projectService.updateProject(activeProject.id, { language: langId });
    setActiveProject((prev) => ({ ...prev, language: langId }));
    toast.info(`Switched default project runtime to ${getLanguageById(langId).name}`);
  };

  // Code Execution
  const runActiveCode = async () => {
    if (!activeProject) {
      toast.warning('No active project to run');
      return;
    }

    const currentFile = activeProject.files?.find((f) => f.id === activeFileId) || activeProject.files?.[0];
    if (!currentFile) {
      toast.warning('No executable file found');
      return;
    }

    const currentCode = fileContents[currentFile.id] ?? currentFile.content ?? '';
    const fileLang = getLanguageByFilename(currentFile.name).id || activeProject.language;

    setOutputPanelOpen(true);
    setExecutionState('Queued');
    setOutputPanelTab('stdout');

    try {
      const res = await executionService.runCode({
        projectId: activeProject.id,
        projectName: activeProject.name,
        filename: currentFile.name,
        language: fileLang,
        code: currentCode,
        stdin: stdinValue,
        onStatusChange: (status) => setExecutionState(status),
      });

      setExecutionResult(res);
      setExecutionState(res.status);

      // Increment runs count in project
      setActiveProject((prev) => ({
        ...prev,
        runsCount: (prev.runsCount || 0) + 1,
      }));

      if (res.status === 'Completed') {
        toast.success(`Execution completed in ${res.durationMs}ms`);
      } else {
        setOutputPanelTab('stderr');
        toast.error(`Execution failed with exit code ${res.exitCode}`);
      }
    } catch (err) {
      setExecutionState('Failed');
      setExecutionResult({
        id: `err_${Date.now()}`,
        status: 'Failed',
        exitCode: 1,
        durationMs: 0,
        stdout: '',
        stderr: err.message,
        stdin: stdinValue,
      });
      setOutputPanelTab('stderr');
      toast.error(`Execution error: ${err.message}`);
    }
  };

  const stopExecution = async () => {
    if (executionResult?.id) {
      try {
        await executionService.cancelExecution(executionResult.id);
      } catch (e) {
        console.error(e);
      }
    }
    setExecutionState('Idle');
    toast.info('Execution cancelled');
  };

  const clearOutput = () => {
    setExecutionResult(null);
    setExecutionState('Idle');
    toast.info('Output cleared');
  };

  const activeFile = activeProject?.files?.find((f) => f.id === activeFileId) || openFiles[0] || null;
  const activeContent = activeFile ? fileContents[activeFile.id] ?? activeFile.content ?? '' : '';

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        loadingProjects,
        loadProjects,
        selectProject,
        createProject,
        renameProject,
        deleteProject,

        // File states
        openFiles,
        activeFile,
        activeFileId,
        activeContent,
        unsavedFiles,
        fileContents,
        openFile,
        closeFile,
        updateFileContent,
        saveActiveFile,
        saveAllFiles,
        createFile,
        deleteFile,
        renameFile,

        // Settings
        editorTheme,
        setEditorTheme,
        editorSettings,
        setEditorSettings,
        changeLanguage,

        // Layout
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar: () => setSidebarOpen((p) => !p),
        outputPanelOpen,
        setOutputPanelOpen,
        toggleOutputPanel: () => setOutputPanelOpen((p) => !p),
        outputPanelTab,
        setOutputPanelTab,
        outputPanelHeight,
        setOutputPanelHeight,
        detailsPanelOpen,
        setDetailsPanelOpen,
        toggleDetailsPanel: () => setDetailsPanelOpen((p) => !p),

        // Execution
        executionState,
        executionResult,
        stdinValue,
        setStdinValue,
        executionsHistory,
        runActiveCode,
        stopExecution,
        clearOutput,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
