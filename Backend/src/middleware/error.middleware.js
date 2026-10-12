const logger = require('../logger');
const config = require('../config');

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.status ? err.status : 500);

  // Structured logging
  if (statusCode >= 500) {
    logger.error(
      {
        requestId: req.id,
        err: err.message,
        stack: err.stack,
        url: req.originalUrl,
      },
      'Unhandled internal server exception'
    );
  } else {
    logger.warn(
      {
        requestId: req.id,
        statusCode,
        err: err.message,
        url: req.originalUrl,
      },
      'Client request error'
    );
  }

  // Consistent JSON response
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred',
    ...(config.nodeEnv === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
