const executionService = require('../services/execution.service');

const executionController = {
  async runExecution(req, res, next) {
    try {
      const result = await executionService.executeCode(req.userId, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getExecution(req, res, next) {
    try {
      const execution = await executionService.getExecutionById(req.userId, req.params.executionId);
      res.status(200).json(execution);
    } catch (err) {
      next(err);
    }
  },

  async getExecutions(req, res, next) {
    try {
      const { projectId, language, status, limit, offset } = req.query;
      const list = await executionService.getUserExecutions(req.userId, {
        projectId,
        language,
        status,
        limit,
        offset,
      });
      res.status(200).json(list);
    } catch (err) {
      next(err);
    }
  },

  async cancelExecution(req, res, next) {
    try {
      const result = await executionService.cancelExecution(req.userId, req.params.executionId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = executionController;
