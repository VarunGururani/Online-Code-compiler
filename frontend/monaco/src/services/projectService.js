import { api, getIsDemoMode } from './api';
import { INITIAL_PROJECTS } from '../utils/mockData';
import { getStarterTemplate } from '../utils/starterTemplates';

const DEMO_PROJECTS_KEY = 'cloud_ide_demo_projects';

const getStoredProjects = () => {
  const data = localStorage.getItem(DEMO_PROJECTS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PROJECTS;
  }
};

const saveStoredProjects = (projects) => {
  localStorage.setItem(DEMO_PROJECTS_KEY, JSON.stringify(projects));
};

export const projectService = {
  async getProjects() {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 200));
      return getStoredProjects();
    }
    const res = await api.get('/projects');
    return res.data;
  },

  async getProject(projectId) {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 150));
      const projects = getStoredProjects();
      const proj = projects.find((p) => p.id === projectId);
      if (!proj) throw new Error('Project not found');
      return proj;
    }
    const res = await api.get(`/projects/${projectId}`);
    return res.data;
  },

  async createProject({ name, description, language }) {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 400));
      const starter = getStarterTemplate(language);
      const newProj = {
        id: `proj_${Date.now()}`,
        name: name || 'Untitled Project',
        description: description || `A new ${language.toUpperCase()} cloud project`,
        language,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        runsCount: 0,
        files: [
          {
            id: `file_${Date.now()}_main`,
            name: starter.filename,
            path: `/${starter.filename}`,
            language: language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'python',
            content: starter.content,
          },
        ],
      };
      const projects = getStoredProjects();
      projects.unshift(newProj);
      saveStoredProjects(projects);
      return newProj;
    }
    const res = await api.post('/projects', { name, description, language });
    return res.data;
  },

  async updateProject(projectId, updates) {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 200));
      const projects = getStoredProjects();
      const index = projects.findIndex((p) => p.id === projectId);
      if (index === -1) throw new Error('Project not found');
      projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveStoredProjects(projects);
      return projects[index];
    }
    const res = await api.patch(`/projects/${projectId}`, updates);
    return res.data;
  },

  async deleteProject(projectId) {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 300));
      const projects = getStoredProjects();
      const filtered = projects.filter((p) => p.id !== projectId);
      saveStoredProjects(filtered);
      return { success: true };
    }
    const res = await api.delete(`/projects/${projectId}`);
    return res.data;
  },

  // File Operations
  async getFiles(projectId) {
    if (getIsDemoMode()) {
      const proj = await projectService.getProject(projectId);
      return proj.files || [];
    }
    const res = await api.get(`/projects/${projectId}/files`);
    return res.data;
  },

  async createFile(projectId, { name, content = '' }) {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 250));
      const projects = getStoredProjects();
      const proj = projects.find((p) => p.id === projectId);
      if (!proj) throw new Error('Project not found');
      
      const newFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name,
        path: `/${name}`,
        language: name.endsWith('.py') ? 'python' : name.endsWith('.java') ? 'java' : name.endsWith('.cpp') ? 'cpp' : 'plaintext',
        content,
      };
      
      proj.files.push(newFile);
      proj.updatedAt = new Date().toISOString();
      saveStoredProjects(projects);
      return newFile;
    }
    const res = await api.post(`/projects/${projectId}/files`, { name, content });
    return res.data;
  },

  async updateFile(projectId, fileId, updates) {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 150));
      const projects = getStoredProjects();
      const proj = projects.find((p) => p.id === projectId);
      if (!proj) throw new Error('Project not found');
      
      const fileIndex = proj.files.findIndex((f) => f.id === fileId);
      if (fileIndex === -1) throw new Error('File not found');
      
      proj.files[fileIndex] = {
        ...proj.files[fileIndex],
        ...updates,
      };
      proj.updatedAt = new Date().toISOString();
      saveStoredProjects(projects);
      return proj.files[fileIndex];
    }
    const res = await api.patch(`/files/${fileId}`, updates);
    return res.data;
  },

  async deleteFile(projectId, fileId) {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 200));
      const projects = getStoredProjects();
      const proj = projects.find((p) => p.id === projectId);
      if (!proj) throw new Error('Project not found');
      
      proj.files = proj.files.filter((f) => f.id !== fileId);
      proj.updatedAt = new Date().toISOString();
      saveStoredProjects(projects);
      return { success: true };
    }
    const res = await api.delete(`/files/${fileId}`);
    return res.data;
  },
};

export default projectService;
