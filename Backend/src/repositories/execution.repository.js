const { query } = require('../db/pool');
const { randomUUID: uuidv4 } = require('crypto');

const memoryExecutions = new Map();

const executionRepository = {
  async create({
    user_id,
    project_id = null,
    file_id = null,
    language,
    status = 'running',
    stdout = '',
    stderr = '',
    exit_code = null,
    execution_time_ms = null,
  }) {
    try {
      const sql = `
        INSERT INTO executions (
          user_id, project_id, file_id, language, status, stdout, stderr,
          exit_code, execution_time_ms, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id, user_id, project_id, file_id, language, status, stdout, stderr,
                  exit_code, execution_time_ms, created_at, completed_at
      `;
      const res = await query(sql, [
        user_id,
        project_id,
        file_id,
        language,
        status,
        stdout,
        stderr,
        exit_code,
        execution_time_ms,
      ]);
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const id = uuidv4();
        const now = new Date();
        const exec = {
          id,
          user_id,
          project_id,
          file_id,
          language,
          status,
          stdout,
          stderr,
          exit_code,
          execution_time_ms,
          created_at: now,
          completed_at: null,
        };
        memoryExecutions.set(id, exec);
        return { ...exec };
      }
      throw err;
    }
  },

  async findById(id) {
    try {
      const sql = `
        SELECT e.*, p.name as project_name, f.name as file_name
        FROM executions e
        LEFT JOIN projects p ON e.project_id = p.id
        LEFT JOIN files f ON e.file_id = f.id
        WHERE e.id = $1
      `;
      const res = await query(sql, [id]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const item = memoryExecutions.get(id);
        return item ? { ...item } : null;
      }
      throw err;
    }
  },

  async findByUserId(user_id, { projectId, language, status, limit = 50, offset = 0 } = {}) {
    try {
      const conditions = ['e.user_id = $1'];
      const values = [user_id];
      let paramIndex = 2;

      if (projectId) {
        conditions.push(`e.project_id = $${paramIndex++}`);
        values.push(projectId);
      }
      if (language && language !== 'all') {
        conditions.push(`e.language = $${paramIndex++}`);
        values.push(language);
      }
      if (status && status !== 'all') {
        conditions.push(`e.status = $${paramIndex++}`);
        values.push(status);
      }

      values.push(limit);
      const limitParam = `$${paramIndex++}`;
      values.push(offset);
      const offsetParam = `$${paramIndex++}`;

      const sql = `
        SELECT e.*, p.name as project_name, f.name as file_name
        FROM executions e
        LEFT JOIN projects p ON e.project_id = p.id
        LEFT JOIN files f ON e.file_id = f.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY e.created_at DESC
        LIMIT ${limitParam} OFFSET ${offsetParam}
      `;

      const res = await query(sql, values);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        let list = [];
        for (const e of memoryExecutions.values()) {
          if (e.user_id === user_id) {
            if (projectId && e.project_id !== projectId) continue;
            if (language && language !== 'all' && e.language !== language) continue;
            if (status && status !== 'all' && e.status !== status) continue;
            list.push({ ...e });
          }
        }
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return list.slice(offset, offset + limit);
      }
      throw err;
    }
  },

  async update(id, { status, stdout, stderr, exit_code, execution_time_ms }) {
    try {
      const updates = ['completed_at = NOW()'];
      const values = [id];
      let paramIndex = 2;

      if (status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        values.push(status);
      }
      if (stdout !== undefined) {
        updates.push(`stdout = $${paramIndex++}`);
        values.push(stdout);
      }
      if (stderr !== undefined) {
        updates.push(`stderr = $${paramIndex++}`);
        values.push(stderr);
      }
      if (exit_code !== undefined) {
        updates.push(`exit_code = $${paramIndex++}`);
        values.push(exit_code);
      }
      if (execution_time_ms !== undefined) {
        updates.push(`execution_time_ms = $${paramIndex++}`);
        values.push(execution_time_ms);
      }

      const sql = `
        UPDATE executions
        SET ${updates.join(', ')}
        WHERE id = $1
        RETURNING id, user_id, project_id, file_id, language, status, stdout, stderr,
                  exit_code, execution_time_ms, created_at, completed_at
      `;
      const res = await query(sql, values);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const item = memoryExecutions.get(id);
        if (!item) return null;
        if (status !== undefined) item.status = status;
        if (stdout !== undefined) item.stdout = stdout;
        if (stderr !== undefined) item.stderr = stderr;
        if (exit_code !== undefined) item.exit_code = exit_code;
        if (execution_time_ms !== undefined) item.execution_time_ms = execution_time_ms;
        item.completed_at = new Date();
        return { ...item };
      }
      throw err;
    }
  },
};

module.exports = executionRepository;
