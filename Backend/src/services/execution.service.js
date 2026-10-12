const executionRepository = require('../repositories/execution.repository');
const dockerExecutionService = require('./docker-execution.service');
const { cacheSet, cacheGet } = require('../redis/client');
const logger = require('../logger');

const ALLOWED_LANGUAGES = ['python', 'java', 'cpp'];

const executionService = {
  async executeCode(userId, { language, code, stdin = '', projectId = null, fileId = null }) {
    if (!ALLOWED_LANGUAGES.includes(language)) {
      const err = new Error(`Invalid language '${language}'. Supported languages: ${ALLOWED_LANGUAGES.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    if (!code || typeof code !== 'string') {
      const err = new Error('Source code is required');
      err.statusCode = 400;
      throw err;
    }

    // 1. Create execution record with initial 'running' status
    const initialRecord = await executionRepository.create({
      user_id: userId,
      project_id: projectId,
      file_id: fileId,
      language,
      status: 'running',
    });

    const executionId = initialRecord.id;
    logger.info({ executionId, userId, language }, 'Starting code execution job');

    try {
      // 2. Run inside isolated Docker container
      const result = await dockerExecutionService.execute({
        language,
        code,
        stdin,
      });

      // 3. Update execution audit in database
      const updatedRecord = await executionRepository.update(executionId, {
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        exit_code: result.exitCode,
        execution_time_ms: result.executionTimeMs,
      });

      // 4. Cache execution record in Redis for rapid subsequent reads
      await cacheSet(`exec:${executionId}`, updatedRecord, 300);

      logger.info(
        { executionId, status: result.status, durationMs: result.executionTimeMs },
        'Code execution completed'
      );

      return {
        success: true,
        execution: {
          id: updatedRecord.id,
          status: updatedRecord.status,
          language: updatedRecord.language,
          stdout: updatedRecord.stdout,
          stderr: updatedRecord.stderr,
          exitCode: updatedRecord.exit_code,
          executionTimeMs: updatedRecord.execution_time_ms,
          projectId: updatedRecord.project_id,
          fileId: updatedRecord.file_id,
          createdAt: updatedRecord.created_at,
          completedAt: updatedRecord.completed_at,
        },
      };
    } catch (err) {
      logger.error({ executionId, err: err.message }, 'Execution engine error');
      const failedRecord = await executionRepository.update(executionId, {
        status: 'failed',
        stderr: `Internal execution error: ${err.message}`,
        exit_code: 1,
        execution_time_ms: 0,
      });

      return {
        success: false,
        execution: {
          id: failedRecord.id,
          status: 'failed',
          language,
          stdout: '',
          stderr: failedRecord.stderr,
          exitCode: 1,
          executionTimeMs: 0,
        },
      };
    }
  },

  async getExecutionById(userId, executionId) {
    // Check Redis cache first
    const cached = await cacheGet(`exec:${executionId}`);
    if (cached) {
      if (cached.user_id !== userId) {
        const err = new Error('Access denied: You do not have permission to view this execution');
        err.statusCode = 403;
        throw err;
      }
      return cached;
    }

    const record = await executionRepository.findById(executionId);
    if (!record) {
      const err = new Error('Execution record not found');
      err.statusCode = 404;
      throw err;
    }

    if (record.user_id !== userId) {
      const err = new Error('Access denied: You do not have permission to view this execution');
      err.statusCode = 403;
      throw err;
    }

    return record;
  },

  async getUserExecutions(userId, filters = {}) {
    return executionRepository.findByUserId(userId, filters);
  },

  async cancelExecution(userId, executionId) {
    const record = await this.getExecutionById(userId, executionId);
    if (record.status === 'completed' || record.status === 'failed') {
      return { success: false, message: 'Execution has already finished' };
    }

    const updated = await executionRepository.update(executionId, {
      status: 'cancelled',
      stderr: 'Execution was cancelled by the user',
      exit_code: 130,
    });

    return { success: true, execution: updated };
  },
};

module.exports = executionService;
