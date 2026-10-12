const authService = require('../services/auth.service');

async function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required: please log in to access this resource',
    });
  }

  try {
    const user = await authService.getUserById(req.session.userId);
    req.userId = user.id;
    req.user = user;
    next();
  } catch (err) {
    // If user no longer exists in DB, invalidate session
    req.session.destroy(() => {
      res.status(401).json({
        success: false,
        error: 'Session invalid or user no longer exists',
      });
    });
  }
}

module.exports = { requireAuth };
