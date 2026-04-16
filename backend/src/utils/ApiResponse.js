class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    if (data !== null) this.data = data;
  }

  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }

  static created(res, message, data = null) {
    return ApiResponse.success(res, message, data, 201);
  }

  static error(res, statusCode, message, errors = []) {
    const body = { success: false, message };
    if (errors.length) body.errors = errors;
    return res.status(statusCode).json(body);
  }
}

module.exports = ApiResponse;
