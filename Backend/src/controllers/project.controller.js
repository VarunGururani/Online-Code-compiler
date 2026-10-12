const projectService = require('../services/project.service');

const projectController = {
  async getProjects(req, res, next) {
    try {
      const projects = await projectService.getUserProjects(req.userId);
      res.status(200).json(projects);
    } catch (err) {
      next(err);
    }
  },

  async createProject(req, res, next) {
    try {
      const project = await projectService.createProject(req.userId, req.body);
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  },

  async getProject(req, res, next) {
    try {
      const project = await projectService.getProjectById(req.userId, req.params.projectId);
      res.status(200).json(project);
    } catch (err) {
      next(err);
    }
  },

  async updateProject(req, res, next) {
    try {
      const updated = await projectService.updateProject(req.userId, req.params.projectId, req.body);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteProject(req, res, next) {
    try {
      const result = await projectService.deleteProject(req.userId, req.params.projectId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = projectController;
