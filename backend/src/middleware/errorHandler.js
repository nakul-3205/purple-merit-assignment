const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new ApiError(409, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    err = new ApiError(422, 'Validation failed', messages);
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    err = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} — ${statusCode}: ${message}`, { stack: err.stack });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} — ${statusCode}: ${message}`);
  }

  const body = { success: false, message };
  if (err.errors && err.errors.length) body.errors = err.errors;
  if (process.env.NODE_ENV === 'development') body.stack = err.stack;

  return res.status(statusCode).json(body);
};

module.exports = { errorHandler };
