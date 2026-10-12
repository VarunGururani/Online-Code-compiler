const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { updateFileValidator, fileIdParamValidator } = require('../validators/file.validator');

// All file routes require authentication
router.use(requireAuth);

router.patch('/:fileId', updateFileValidator, fileController.updateFile);
router.delete('/:fileId', fileIdParamValidator, fileController.deleteFile);

module.exports = router;
