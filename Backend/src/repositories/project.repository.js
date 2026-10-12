const { query } = require('../db/pool');
const { randomUUID: uuidv4 } = require('crypto');

const memoryProjects = new Map();

const projectRepository = {
  async create({ user_id, name, description = '' }) {
    try {
      const sql = `
        INSERT INTO projects (user_id, name, description, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id, user_id, name, description, created_at, updated_at
      `;
      const res = await query(sql, [user_id, name, description]);
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const id = uuidv4();
        const now = new Date();
        const proj = { id, user_id, name, description, created_at: now, updated_at: now };
        memoryProjects.set(id, proj);
        return { ...proj };
      }
      throw err;
    }
  },

  async findById(id) {
    try {
      const sql = `
        SELECT id, user_id, name, description, created_at, updated_at
        FROM projects
        WHERE id = $1
      `;
      const res = await query(sql, [id]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const proj = memoryProjects.get(id);
        return proj ? { ...proj } : null;
      }
      throw err;
    }
  },

  async findByUserId(user_id) {
    try {
      const sql = `
        SELECT id, user_id, name, description, created_at, updated_at
        FROM projects
        WHERE user_id = $1
        ORDER BY updated_at DESC
      `;
      const res = await query(sql, [user_id]);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const list = [];
        for (const p of memoryProjects.values()) {
          if (p.user_id === user_id) list.push({ ...p });
        }
        return list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      }
      throw err;
    }
  },

  async update(id, { name, description }) {
    try {
      const updates = [];
      const values = [id];
      let paramIndex = 2;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(description);
      }

      updates.push(`updated_at = NOW()`);

      const sql = `
        UPDATE projects
        SET ${updates.join(', ')}
        WHERE id = $1
        RETURNING id, user_id, name, description, created_at, updated_at
      `;
      const res = await query(sql, values);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const p = memoryProjects.get(id);
        if (!p) return null;
        if (name !== undefined) p.name = name;
        if (description !== undefined) p.description = description;
        p.updated_at = new Date();
        return { ...p };
      }
      throw err;
    }
  },

  async delete(id) {
    try {
      const sql = `DELETE FROM projects WHERE id = $1 RETURNING id`;
      const res = await query(sql, [id]);
      return res.rowCount > 0;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        return memoryProjects.delete(id);
      }
      throw err;
    }
  },
};

module.exports = projectRepository;
