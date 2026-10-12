const rateLimit = require('express-rate-limit');
const config = require('../config');

// In test environment, disable rate limits to allow fast test execution
const isTest = config.isTest;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : 20, // 20 attempts per 15 mins
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const executionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTest ? 10000 : 30, // 30 runs per minute
  message: {
    success: false,
    error: 'Code execution rate limit exceeded. Please wait a moment before running again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 500,
  message: {
    success: false,
    error: 'Too many API requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  executionLimiter,
  apiLimiter,
};
