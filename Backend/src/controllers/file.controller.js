const fileService = require('../services/file.service');

const fileController = {
  async getFiles(req, res, next) {
    try {
      const files = await fileService.getProjectFiles(req.userId, req.params.projectId);
      res.status(200).json(files);
    } catch (err) {
      next(err);
    }
  },

  async createFile(req, res, next) {
    try {
      const file = await fileService.createFile(req.userId, req.params.projectId, req.body);
      res.status(201).json(file);
    } catch (err) {
      next(err);
    }
  },

  async updateFile(req, res, next) {
    try {
      const updated = await fileService.updateFile(req.userId, req.params.fileId, req.body);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteFile(req, res, next) {
    try {
      const result = await fileService.deleteFile(req.userId, req.params.fileId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = fileController;
