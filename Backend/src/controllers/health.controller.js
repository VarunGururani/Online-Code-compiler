const { checkDbHealth } = require('../db/pool');
const { checkRedisHealth } = require('../redis/client');

const healthController = {
  async checkHealth(req, res) {
    const dbStatus = await checkDbHealth();
    const redisStatus = await checkRedisHealth();

    const isHealthy = true; // Application itself is up and running

    res.status(200).json({
      status: 'ok',
      service: 'Cloud IDE Backend API',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      dependencies: {
        database: {
          connected: dbStatus.connected,
          ...(dbStatus.error ? { note: 'Operating in development fallback mode' } : {}),
        },
        redis: {
          enabled: redisStatus.enabled,
          connected: redisStatus.connected,
          ...(redisStatus.error ? { note: 'Operating in in-memory session mode' } : {}),
        },
      },
    });
  },
};

module.exports = healthController;
