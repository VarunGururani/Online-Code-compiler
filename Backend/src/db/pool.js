const { Pool } = require('pg');
const config = require('../config');
const logger = require('../logger');

let pool;

function getPool() {
  if (!pool) {
    const poolConfig = config.db.connectionString
      ? {
          connectionString: config.db.connectionString,
          max: config.db.max,
          connectionTimeoutMillis: config.db.connectionTimeoutMillis,
          idleTimeoutMillis: config.db.idleTimeoutMillis,
        }
      : {
          host: config.db.host,
          port: config.db.port,
          user: config.db.user,
          password: config.db.password,
          database: config.db.database,
          max: config.db.max,
          connectionTimeoutMillis: config.db.connectionTimeoutMillis,
          idleTimeoutMillis: config.db.idleTimeoutMillis,
        };

    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      logger.error({ err: err.message }, 'Unexpected error on idle PostgreSQL client');
    });
  }
  return pool;
}

// Parameterized query helper
async function query(text, params) {
  const p = getPool();
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn({ text, duration, rows: res.rowCount }, 'Slow database query executed');
    }
    return res;
  } catch (err) {
    logger.error({ err: err.message, query: text }, 'Database query error');
    throw err;
  }
}

// Transaction helper
async function withTransaction(callback) {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error({ err: err.message }, 'Transaction rolled back due to error');
    throw err;
  } finally {
    client.release();
  }
}

// Check connectivity
async function checkDbHealth() {
  try {
    const p = getPool();
    const res = await p.query('SELECT 1 as healthy');
    return { connected: res.rows[0].healthy === 1 };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

// Close pool
async function closePool() {
  if (pool) {
    logger.info('Closing PostgreSQL connection pool...');
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool,
  query,
  withTransaction,
  checkDbHealth,
  closePool,
};
