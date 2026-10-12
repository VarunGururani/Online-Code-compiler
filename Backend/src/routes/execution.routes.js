const express = require('express');
const router = express.Router();
const executionController = require('../controllers/execution.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { executionLimiter } = require('../middleware/rate-limiter.middleware');
const {
  runExecutionValidator,
  executionIdParamValidator,
  listExecutionsQueryValidator,
} = require('../validators/execution.validator');

// All execution routes require authentication
router.use(requireAuth);

router.post('/', executionLimiter, runExecutionValidator, executionController.runExecution);
router.get('/:executionId', executionIdParamValidator, executionController.getExecution);
router.get('/', listExecutionsQueryValidator, executionController.getExecutions);
router.post('/:executionId/cancel', executionIdParamValidator, executionController.cancelExecution);

module.exports = router;
