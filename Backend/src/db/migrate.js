const fs = require('fs');
const path = require('path');
const { getPool, query } = require('./pool');
const logger = require('../logger');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  logger.info('Checking database migrations...');

  try {
    // Create migrations tracker table
    await query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const existing = await query(
        'SELECT id FROM schema_migrations WHERE filename = $1',
        [file]
      );

      if (existing.rowCount === 0) {
        logger.info({ migration: file }, 'Applying migration');
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

        // Run migration in a transaction
        const client = await getPool().connect();
        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query(
            'INSERT INTO schema_migrations (filename) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
          logger.info({ migration: file }, 'Migration applied successfully');
        } catch (migrationErr) {
          await client.query('ROLLBACK');
          logger.error({ migration: file, err: migrationErr.message }, 'Migration failed');
          throw migrationErr;
        } finally {
          client.release();
        }
      }
    }

    logger.info('All database migrations are up to date');
    return true;
  } catch (err) {
    logger.error({ err: err.message }, 'Error running database migrations');
    throw err;
  }
}

// Allow direct CLI execution: `node src/db/migrate.js`
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runMigrations };
