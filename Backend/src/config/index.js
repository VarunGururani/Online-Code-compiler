require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',

  // Database
  db: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cloud_ide',
    max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    connectionTimeoutMillis: parseInt(process.env.DB_TIMEOUT_MS, 10) || 5000,
    idleTimeoutMillis: 30000,
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    enabled: process.env.REDIS_ENABLED !== 'false',
    ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS, 10) || 3600,
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'dev_session_secret_change_in_production',
    name: 'cloud_ide_sid',
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
      sameSite: process.env.COOKIE_SAME_SITE || 'lax',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE_MS, 10) || 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // Docker execution settings
  docker: {
    enabled: process.env.DOCKER_ENABLED !== 'false',
    networkMode: process.env.DOCKER_NETWORK_MODE || 'none',
    memoryLimit: process.env.DOCKER_MEM_LIMIT || '256m',
    cpus: process.env.DOCKER_CPUS || '0.5',
    pidsLimit: parseInt(process.env.DOCKER_PIDS_LIMIT, 10) || 64,
    timeoutMs: parseInt(process.env.EXECUTION_TIMEOUT_MS, 10) || 10000,
    maxCodeSizeBytes: parseInt(process.env.MAX_CODE_SIZE_BYTES, 10) || 65536,
    maxStdinSizeBytes: parseInt(process.env.MAX_STDIN_SIZE_BYTES, 10) || 65536,
    maxOutputSizeBytes: parseInt(process.env.MAX_OUTPUT_SIZE_BYTES, 10) || 262144,
    images: {
      python: process.env.DOCKER_IMAGE_PYTHON || 'python:3.11-slim',
      cpp: process.env.DOCKER_IMAGE_CPP || 'gcc:13.2',
      java: process.env.DOCKER_IMAGE_JAVA || 'eclipse-temurin:17-jdk-alpine',
    },
  },
};

// Validate critical environment configurations in production
if (config.isProduction) {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters in production');
  }
}

module.exports = config;
