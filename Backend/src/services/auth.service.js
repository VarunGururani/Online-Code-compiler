const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const logger = require('../logger');

const BCRYPT_SALT_ROUNDS = 10;

const authService = {
  async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      const err = new Error('An account with this email address already exists');
      err.statusCode = 409;
      throw err;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user in database
    const user = await userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
    });

    logger.info({ userId: user.id, email: user.email }, 'User registered successfully');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };
  },

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      logger.warn({ email: normalizedEmail }, 'Authentication failure: password mismatch');
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    logger.info({ userId: user.id }, 'User logged in successfully');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };
  },

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };
  },
};

module.exports = authService;
