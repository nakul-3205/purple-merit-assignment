const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Reads express-validator results and throws ApiError if any.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new ApiError(422, 'Validation failed', messages);
  }
  next();
};

module.exports = { validate };
