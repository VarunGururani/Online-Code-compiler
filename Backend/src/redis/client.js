const { createClient } = require('redis');
const config = require('../config');
const logger = require('../logger');

let client = null;
let isConnected = false;

function getRedisClient() {
  if (!config.redis.enabled) {
    return null;
  }

  if (!client) {
    client = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: false,
        connectTimeout: 1000,
      },
    });

    client.on('error', (err) => {
      isConnected = false;
    });

    client.on('connect', () => {
      isConnected = true;
      logger.info('Connected to Redis service');
    });

    client.on('ready', () => {
      isConnected = true;
    });

    client.on('end', () => {
      isConnected = false;
    });
  }

  return client;
}

async function connectRedis() {
  if (!config.redis.enabled) {
    return false;
  }
  const c = getRedisClient();
  if (c && !c.isOpen) {
    try {
      await c.connect();
      return true;
    } catch (err) {
      logger.info('Redis is offline on localhost:6379. Operating in resilient in-memory session mode.');
      return false;
    }
  }
  return isConnected;
}

async function checkRedisHealth() {
  if (!config.redis.enabled) {
    return { enabled: false, connected: false };
  }
  try {
    const c = getRedisClient();
    if (!c || !c.isOpen) {
      return { enabled: true, connected: false, error: 'Redis client not connected' };
    }
    const pong = await c.ping();
    return { enabled: true, connected: pong === 'PONG' };
  } catch (err) {
    return { enabled: true, connected: false, error: err.message };
  }
}

async function cacheSet(key, value, ttlSeconds = config.redis.ttlSeconds) {
  try {
    const c = getRedisClient();
    if (c && c.isOpen) {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      await c.set(key, serialized, { EX: ttlSeconds });
      return true;
    }
  } catch (err) {
    logger.warn({ key, err: err.message }, 'Redis cacheSet failed');
  }
  return false;
}

async function cacheGet(key) {
  try {
    const c = getRedisClient();
    if (c && c.isOpen) {
      const data = await c.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
  } catch (err) {
    logger.warn({ key, err: err.message }, 'Redis cacheGet failed');
  }
  return null;
}

async function cacheDel(key) {
  try {
    const c = getRedisClient();
    if (c && c.isOpen) {
      await c.del(key);
      return true;
    }
  } catch (err) {
    logger.warn({ key, err: err.message }, 'Redis cacheDel failed');
  }
  return false;
}

async function closeRedis() {
  if (client && client.isOpen) {
    logger.info('Closing Redis client...');
    await client.quit();
    client = null;
    isConnected = false;
  }
}

module.exports = {
  getRedisClient,
  connectRedis,
  checkRedisHealth,
  cacheSet,
  cacheGet,
  cacheDel,
  closeRedis,
};
