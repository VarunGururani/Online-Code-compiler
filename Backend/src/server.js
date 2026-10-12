const app = require('./app');
const config = require('./config');
const logger = require('./logger');
const { closePool, checkDbHealth } = require('./db/pool');
const { runMigrations } = require('./db/migrate');
const { connectRedis, closeRedis } = require('./redis/client');

let server;

async function startServer() {
  logger.info({ nodeEnv: config.nodeEnv, port: config.port }, 'Starting Cloud IDE Backend...');

  // 1. Initialize Redis connection if enabled
  try {
    await connectRedis();
  } catch (redisErr) {
    logger.info('Operating in resilient in-memory session mode (Redis offline).');
  }

  // 2. Check and initialize Database Migrations if PostgreSQL is reachable
  try {
    const dbStatus = await checkDbHealth();
    if (dbStatus.connected) {
      logger.info('Connected to PostgreSQL. Running database migrations...');
      await runMigrations();
    } else {
      logger.info('PostgreSQL offline. Operating in resilient in-memory development mode (start Docker to use persistent DB).');
    }
  } catch (dbErr) {
    logger.info('PostgreSQL offline. Operating in resilient in-memory development mode.');
  }

  // 3. Start HTTP Server
  server = app.listen(config.port, () => {
    logger.info(`🚀 Cloud IDE API Server is listening on port ${config.port}`);
    logger.info(`🔗 Base URL: http://localhost:${config.port}/api`);
    logger.info(`🌐 Allowed Frontend Origin: ${config.frontendOrigin}`);
  });

  // 4. Register Graceful Shutdown Handlers
  const handleShutdown = async (signal) => {
    logger.info({ signal }, 'Received shutdown signal. Closing resources gracefully...');

    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
      });
    }

    try {
      await closeRedis();
      await closePool();
      logger.info('All database and Redis connections successfully closed. Exiting process.');
      process.exit(0);
    } catch (shutdownErr) {
      logger.error({ err: shutdownErr.message }, 'Error encountered during graceful shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

if (require.main === module) {
  startServer().catch((err) => {
    logger.fatal({ err: err.message }, 'Fatal error during server startup');
    process.exit(1);
  });
}

module.exports = { startServer };
