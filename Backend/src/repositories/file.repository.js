const { query } = require('../db/pool');
const { randomUUID: uuidv4 } = require('crypto');

const memoryFiles = new Map();

const fileRepository = {
  async create({ project_id, name, path, language, content = '' }) {
    try {
      const sql = `
        INSERT INTO files (project_id, name, path, language, content, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, project_id, name, path, language, content, created_at, updated_at
      `;
      const res = await query(sql, [project_id, name, path, language, content]);
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        // Enforce path uniqueness per project
        for (const f of memoryFiles.values()) {
          if (f.project_id === project_id && f.path === path) {
            const conflictErr = new Error(`File at path '${path}' already exists in this project`);
            conflictErr.code = '23505';
            throw conflictErr;
          }
        }
        const id = uuidv4();
        const now = new Date();
        const f = { id, project_id, name, path, language, content, created_at: now, updated_at: now };
        memoryFiles.set(id, f);
        return { ...f };
      }
      throw err;
    }
  },

  async findById(id) {
    try {
      const sql = `
        SELECT id, project_id, name, path, language, content, created_at, updated_at
        FROM files
        WHERE id = $1
      `;
      const res = await query(sql, [id]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const f = memoryFiles.get(id);
        return f ? { ...f } : null;
      }
      throw err;
    }
  },

  async findByProjectId(project_id) {
    try {
      const sql = `
        SELECT id, project_id, name, path, language, content, created_at, updated_at
        FROM files
        WHERE project_id = $1
        ORDER BY name ASC
      `;
      const res = await query(sql, [project_id]);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const list = [];
        for (const f of memoryFiles.values()) {
          if (f.project_id === project_id) list.push({ ...f });
        }
        return list.sort((a, b) => a.name.localeCompare(b.name));
      }
      throw err;
    }
  },

  async findByProjectPath(project_id, path) {
    try {
      const sql = `
        SELECT id, project_id, name, path, language, content, created_at, updated_at
        FROM files
        WHERE project_id = $1 AND path = $2
      `;
      const res = await query(sql, [project_id, path]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        for (const f of memoryFiles.values()) {
          if (f.project_id === project_id && f.path === path) return { ...f };
        }
        return null;
      }
      throw err;
    }
  },

  async update(id, { name, path, language, content }) {
    try {
      const updates = [];
      const values = [id];
      let paramIndex = 2;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (path !== undefined) {
        updates.push(`path = $${paramIndex++}`);
        values.push(path);
      }
      if (language !== undefined) {
        updates.push(`language = $${paramIndex++}`);
        values.push(language);
      }
      if (content !== undefined) {
        updates.push(`content = $${paramIndex++}`);
        values.push(content);
      }

      updates.push(`updated_at = NOW()`);

      const sql = `
        UPDATE files
        SET ${updates.join(', ')}
        WHERE id = $1
        RETURNING id, project_id, name, path, language, content, created_at, updated_at
      `;
      const res = await query(sql, values);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const f = memoryFiles.get(id);
        if (!f) return null;
        if (name !== undefined) f.name = name;
        if (path !== undefined) f.path = path;
        if (language !== undefined) f.language = language;
        if (content !== undefined) f.content = content;
        f.updated_at = new Date();
        return { ...f };
      }
      throw err;
    }
  },

  async delete(id) {
    try {
      const sql = `DELETE FROM files WHERE id = $1 RETURNING id`;
      const res = await query(sql, [id]);
      return res.rowCount > 0;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        return memoryFiles.delete(id);
      }
      throw err;
    }
  },
};

module.exports = fileRepository;
