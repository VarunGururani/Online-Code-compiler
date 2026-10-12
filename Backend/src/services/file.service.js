const path = require('path');
const fileRepository = require('../repositories/file.repository');
const projectRepository = require('../repositories/project.repository');
const logger = require('../logger');

function sanitizePath(rawPath, filename) {
  if (filename && (filename.includes('..') || filename.includes('/') || filename.includes('\\') || filename.includes('\0'))) {
    const err = new Error('Invalid file name: path traversal detected');
    err.statusCode = 400;
    throw err;
  }

  if (rawPath && (rawPath.includes('..') || rawPath.includes('\\') || rawPath.includes('\0'))) {
    const err = new Error('Invalid file path: path traversal detected');
    err.statusCode = 400;
    throw err;
  }

  let targetPath = rawPath || `/${filename}`;
  if (!targetPath.startsWith('/')) {
    targetPath = `/${targetPath}`;
  }

  // Prevent path traversal after normalization
  const normalized = path.posix.normalize(targetPath);
  if (normalized.includes('..') || !normalized.startsWith('/')) {
    const err = new Error('Invalid file path: path traversal detected');
    err.statusCode = 400;
    throw err;
  }

  return normalized;
}

function detectLanguage(filename) {
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.java')) return 'java';
  if (filename.endsWith('.cpp') || filename.endsWith('.cc') || filename.endsWith('.h') || filename.endsWith('.hpp')) return 'cpp';
  if (filename.endsWith('.json')) return 'json';
  return 'plaintext';
}

const fileService = {
  async getProjectFiles(userId, projectId) {
    // Verify user owns the project
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }
    if (project.user_id !== userId) {
      const err = new Error('Access denied: You do not own this project');
      err.statusCode = 403;
      throw err;
    }

    return fileRepository.findByProjectId(projectId);
  },

  async createFile(userId, projectId, { name, path: filePath, content = '', language }) {
    // Verify user owns the project
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }
    if (project.user_id !== userId) {
      const err = new Error('Access denied: You do not own this project');
      err.statusCode = 403;
      throw err;
    }

    const cleanFilename = name.trim();
    const cleanPath = sanitizePath(filePath, cleanFilename);
    const lang = language || detectLanguage(cleanFilename);

    // Check duplicate path
    const existing = await fileRepository.findByProjectPath(projectId, cleanPath);
    if (existing) {
      const err = new Error(`File at path '${cleanPath}' already exists in this project`);
      err.statusCode = 409;
      throw err;
    }

    const file = await fileRepository.create({
      project_id: projectId,
      name: cleanFilename,
      path: cleanPath,
      language: lang,
      content,
    });

    logger.info({ fileId: file.id, projectId, path: cleanPath }, 'File created');
    return file;
  },

  async updateFile(userId, fileId, updates) {
    const file = await fileRepository.findById(fileId);
    if (!file) {
      const err = new Error('File not found');
      err.statusCode = 404;
      throw err;
    }

    // Verify user owns the project containing this file
    const project = await projectRepository.findById(file.project_id);
    if (!project || project.user_id !== userId) {
      const err = new Error('Access denied: You do not own the project containing this file');
      err.statusCode = 403;
      throw err;
    }

    const fileUpdates = {};
    if (updates.name !== undefined) {
      fileUpdates.name = updates.name.trim();
      fileUpdates.language = detectLanguage(fileUpdates.name);
    }
    if (updates.path !== undefined) {
      fileUpdates.path = sanitizePath(updates.path, fileUpdates.name || file.name);
    }
    if (updates.content !== undefined) {
      fileUpdates.content = updates.content;
    }
    if (updates.language !== undefined) {
      fileUpdates.language = updates.language;
    }

    const updated = await fileRepository.update(fileId, fileUpdates);
    logger.info({ fileId, projectId: file.project_id }, 'File updated');
    return updated;
  },

  async deleteFile(userId, fileId) {
    const file = await fileRepository.findById(fileId);
    if (!file) {
      const err = new Error('File not found');
      err.statusCode = 404;
      throw err;
    }

    // Verify user owns the project containing this file
    const project = await projectRepository.findById(file.project_id);
    if (!project || project.user_id !== userId) {
      const err = new Error('Access denied: You do not own the project containing this file');
      err.statusCode = 403;
      throw err;
    }

    const deleted = await fileRepository.delete(fileId);
    logger.info({ fileId, projectId: file.project_id }, 'File deleted');
    return { success: deleted };
  },
};

module.exports = fileService;
