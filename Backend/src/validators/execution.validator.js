const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('./auth.validator');

const runExecutionValidator = [
  body('language')
    .notEmpty()
    .withMessage('Programming language is required')
    .isIn(['python', 'java', 'cpp'])
    .withMessage("Language must be one of: 'python', 'java', 'cpp'"),
  body('code')
    .notEmpty()
    .withMessage('Source code is required')
    .isString()
    .withMessage('Code must be a string')
    .isLength({ max: 65536 })
    .withMessage('Source code cannot exceed 64KB'),
  body('stdin')
    .optional()
    .isString()
    .withMessage('stdin must be a string')
    .isLength({ max: 65536 })
    .withMessage('Standard input cannot exceed 64KB'),
  body('projectId')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage('Invalid project ID format'),
  body('fileId')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage('Invalid file ID format'),
  handleValidationErrors,
];

const executionIdParamValidator = [
  param('executionId')
    .isUUID()
    .withMessage('Invalid execution ID format'),
  handleValidationErrors,
];

const listExecutionsQueryValidator = [
  query('projectId')
    .optional()
    .isUUID()
    .withMessage('Invalid project ID format'),
  query('language')
    .optional()
    .isIn(['all', 'python', 'java', 'cpp'])
    .withMessage('Invalid language filter'),
  query('status')
    .optional()
    .isIn(['all', 'running', 'completed', 'failed', 'timed_out', 'cancelled'])
    .withMessage('Invalid status filter'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .toInt(),
  handleValidationErrors,
];

module.exports = {
  runExecutionValidator,
  executionIdParamValidator,
  listExecutionsQueryValidator,
};
