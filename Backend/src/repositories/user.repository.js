const { query } = require('../db/pool');
const { randomUUID: uuidv4 } = require('crypto');

// In-memory fallback storage if database is offline (e.g. testing or local dev without postgres)
const memoryUsers = new Map();

const userRepository = {
  async create({ name, email, password_hash }) {
    const normalizedEmail = email.toLowerCase().trim();
    try {
      const sql = `
        INSERT INTO users (name, email, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id, name, email, created_at, updated_at
      `;
      const res = await query(sql, [name, normalizedEmail, password_hash]);
      return res.rows[0];
    } catch (err) {
      // If DB is offline, fallback to in-memory store
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const id = uuidv4();
        const now = new Date();
        const user = { id, name, email: normalizedEmail, password_hash, created_at: now, updated_at: now };
        memoryUsers.set(id, user);
        return { id: user.id, name: user.name, email: user.email, created_at: user.created_at, updated_at: user.updated_at };
      }
      throw err;
    }
  },

  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    try {
      const sql = `
        SELECT id, name, email, password_hash, created_at, updated_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `;
      const res = await query(sql, [normalizedEmail]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        for (const user of memoryUsers.values()) {
          if (user.email === normalizedEmail) return { ...user };
        }
        return null;
      }
      throw err;
    }
  },

  async findById(id) {
    try {
      const sql = `
        SELECT id, name, email, created_at, updated_at
        FROM users
        WHERE id = $1
      `;
      const res = await query(sql, [id]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
        const user = memoryUsers.get(id);
        if (user) {
          return { id: user.id, name: user.name, email: user.email, created_at: user.created_at, updated_at: user.updated_at };
        }
        return null;
      }
      throw err;
    }
  },
};

module.exports = userRepository;
