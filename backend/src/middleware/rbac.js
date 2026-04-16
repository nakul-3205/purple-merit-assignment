const ApiError = require('../utils/ApiError');
const { PERMISSIONS } = require('../constants/roles');
const logger = require('../config/logger');

/**
 * authorize(...roles) — restrict route to specific roles.
 */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) throw new ApiError(401, 'Unauthenticated');
  if (!roles.includes(req.user.role)) {
    logger.warn(`RBAC deny: user ${req.user._id} (${req.user.role}) → required [${roles.join(',')}]`);
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
  next();
};

/**
 * can(permission) — restrict route using permission key.
 */
const can = (permission) => (req, _res, next) => {
  if (!req.user) throw new ApiError(401, 'Unauthenticated');
  const allowed = PERMISSIONS[permission] || [];
  if (!allowed.includes(req.user.role)) {
    logger.warn(`RBAC deny: user ${req.user._id} (${req.user.role}) missing permission "${permission}"`);
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
  next();
};

module.exports = { authorize, can };
