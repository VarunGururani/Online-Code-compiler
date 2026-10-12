const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const fileController = require('../controllers/file.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator,
} = require('../validators/project.validator');
const { createFileValidator } = require('../validators/file.validator');

// All project routes require authentication
router.use(requireAuth);

router.get('/', projectController.getProjects);
router.post('/', createProjectValidator, projectController.createProject);
router.get('/:projectId', projectIdParamValidator, projectController.getProject);
router.patch('/:projectId', updateProjectValidator, projectController.updateProject);
router.delete('/:projectId', projectIdParamValidator, projectController.deleteProject);

// Nested file management endpoints
router.get('/:projectId/files', projectIdParamValidator, fileController.getFiles);
router.post('/:projectId/files', createFileValidator, fileController.createFile);

module.exports = router;
