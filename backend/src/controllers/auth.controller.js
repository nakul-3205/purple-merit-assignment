const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, user } = await authService.login(email, password, res);
  ApiResponse.success(res, 'Login successful', { accessToken, user });
});

const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken;
  const { accessToken } = await authService.refreshAccessToken(incomingToken, res);
  ApiResponse.success(res, 'Token refreshed', { accessToken });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id, res);
  ApiResponse.success(res, 'Logged out successfully');
});

const me = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 'Current user', { user: req.user });
});

module.exports = { login, refresh, logout, me };
