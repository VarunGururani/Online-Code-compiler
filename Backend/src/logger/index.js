const pino = require('pino');
const config = require('../config');

const isDev = config.nodeEnv !== 'production' && !config.isTest;

const logger = pino({
  level: config.isTest ? 'silent' : (process.env.LOG_LEVEL || 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  redact: {
    paths: ['req.headers.cookie', 'password', 'password_hash', 'session', 'authorization'],
    censor: '[REDACTED]',
  },
});

module.exports = logger;
