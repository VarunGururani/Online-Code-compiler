const logger = require('../logger');
const { randomUUID: uuidv4 } = require('crypto');

function requestLogger(req, res, next) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.id = requestId;
  res.setHeader('x-request-id', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      userId: req.session?.userId || null,
      ip: req.ip,
    };

    if (res.statusCode >= 500) {
      logger.error(logData, 'HTTP request server error');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'HTTP request client error');
    } else {
      logger.info(logData, 'HTTP request handled');
    }
  });

  next();
}

module.exports = { requestLogger };
