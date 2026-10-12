const authService = require('../services/auth.service');
const config = require('../config');

const authController = {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      // Establish HTTP-only session
      req.session.userId = user.id;

      res.status(201).json({
        success: true,
        user,
        message: 'Account created successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const user = await authService.login(req.body);
      // Establish HTTP-only session
      req.session.userId = user.id;

      res.status(200).json({
        success: true,
        user,
        message: 'Signed in successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie(config.session.name);
        res.status(200).json({
          success: true,
          message: 'Signed out successfully',
        });
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        user: req.user,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
