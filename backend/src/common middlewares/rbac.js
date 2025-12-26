// src/middlewares/rbac.js

const { UserService } = require("../modules/user/user.service");

/**
 * Usage:
 * protect routes first with auth middleware
 * then restrict access by roles
 *
 * Example:
 * router.get('/admin', protect, rbac('admin'), controllerFn)
 */

const   rbac = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.attachedSECRET.userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'User not authenticated',
      });
    }
    const USER_ROLE = await UserService.getUserRoleById(req.attachedSECRET.userId);
    if (!allowedRoles.includes(USER_ROLE)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

module.exports = { rbac };
