const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const { RedisStore } = require('connect-redis');

const config = require('./config');
const { getRedisClient } = require('./redis/client');
const { requestLogger } = require('./middleware/request-logger.middleware');
const { apiLimiter } = require('./middleware/rate-limiter.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const apiRoutes = require('./routes');
const healthRoutes = require('./routes/health.routes');
const logger = require('./logger');

const app = express();

// Trust reverse proxy (for ALB / CloudFront in production)
app.set('trust proxy', 1);

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Strict CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin === config.frontendOrigin ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin ${origin}`), false);
    },
    credentials: true, // Mandatory for secure HTTP-only session cookies
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-request-id'],
  })
);

// 3. Request Body Parsers with Security Ceilings
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Request Logging
app.use(requestLogger);

// 5. Rate Limiting for Global API Requests
app.use('/api', apiLimiter);

// 6. Session Configuration with Redis / In-Memory Fallback
let sessionStore;
try {
  const redisClient = getRedisClient();
  if (redisClient && redisClient.isOpen) {
    sessionStore = new RedisStore({
      client: redisClient,
      prefix: 'cloud_ide_sess:',
      ttl: config.session.cookie.maxAge / 1000,
    });
    logger.info('Initialized Redis-backed session store');
  }
} catch (sessionErr) {
  logger.warn({ err: sessionErr.message }, 'Using in-memory session store fallback');
}

app.use(
  session({
    store: sessionStore, // Falls back to default MemoryStore if undefined
    name: config.session.name,
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: config.session.cookie.httpOnly,
      secure: config.session.cookie.secure,
      sameSite: config.session.cookie.sameSite,
      maxAge: config.session.cookie.maxAge,
    },
  })
);

// 7. Health & Root Endpoints
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Cloud IDE Backend API',
    version: '1.0.0',
    status: 'online',
    frontend: config.frontendOrigin,
    documentation: '/api/health',
  });
});

// 8. Mount Main API Routes
app.use('/api', apiRoutes);

// 9. Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
