const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./auth.validator');

const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 255 })
    .withMessage('Project name cannot exceed 255 characters'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('language')
    .optional()
    .isIn(['python', 'java', 'cpp'])
    .withMessage('Language must be one of: python, java, cpp'),
  handleValidationErrors,
];

const updateProjectValidator = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Project name cannot exceed 255 characters'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  handleValidationErrors,
];

const projectIdParamValidator = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID format'),
  handleValidationErrors,
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator,
};
