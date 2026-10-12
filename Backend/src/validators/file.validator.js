const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./auth.validator');

const createFileValidator = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID format'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('File name is required')
    .isLength({ max: 255 })
    .withMessage('File name cannot exceed 255 characters'),
  body('path')
    .optional()
    .trim()
    .isLength({ max: 1024 })
    .withMessage('Path cannot exceed 1024 characters'),
  body('content')
    .optional()
    .isLength({ max: 65536 })
    .withMessage('File content cannot exceed 64KB'),
  body('language')
    .optional()
    .isIn(['python', 'java', 'cpp', 'json', 'plaintext'])
    .withMessage('Unsupported language type'),
  handleValidationErrors,
];

const updateFileValidator = [
  param('fileId')
    .isUUID()
    .withMessage('Invalid file ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('File name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('File name cannot exceed 255 characters'),
  body('path')
    .optional()
    .trim()
    .isLength({ max: 1024 })
    .withMessage('Path cannot exceed 1024 characters'),
  body('content')
    .optional()
    .isLength({ max: 65536 })
    .withMessage('File content cannot exceed 64KB'),
  handleValidationErrors,
];

const fileIdParamValidator = [
  param('fileId')
    .isUUID()
    .withMessage('Invalid file ID format'),
  handleValidationErrors,
];

module.exports = {
  createFileValidator,
  updateFileValidator,
  fileIdParamValidator,
};
