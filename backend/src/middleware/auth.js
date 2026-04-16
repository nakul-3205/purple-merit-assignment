const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');

const authenticate = asyncHandler(async (req, _res, next) => {
  let token;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Access token missing');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token';
    logger.warn(`Auth failure: ${msg} — IP: ${req.ip}`);
    throw new ApiError(401, msg);
  }

  const user = await User.findById(decoded.id).select('-password -refreshToken');
  if (!user) throw new ApiError(401, 'User no longer exists');
  if (user.status === 'inactive') throw new ApiError(403, 'Account is deactivated');

  req.user = user;
  next();
});

module.exports = { authenticate };
