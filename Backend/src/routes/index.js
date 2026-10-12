const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const fileRoutes = require('./file.routes');
const executionRoutes = require('./execution.routes');
const healthRoutes = require('./health.routes');

// API Mount points
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/files', fileRoutes);
router.use('/executions', executionRoutes);
router.use('/health', healthRoutes);

module.exports = router;
