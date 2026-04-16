const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../constants/roles');

const getStats = asyncHandler(async (_req, res) => {
  const stats = await userService.getStats();
  ApiResponse.success(res, 'Stats fetched', stats);
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  ApiResponse.success(res, 'Users fetched', result);
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requesterId = String(req.user._id);
  const requesterRole = req.user.role;

  // Regular user can only view own profile
  if (requesterRole === ROLES.USER && id !== requesterId) {
    throw new ApiError(403, 'You can only view your own profile');
  }

  const user = await userService.getUserById(id);
  ApiResponse.success(res, 'User fetched', { user });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user._id);
  ApiResponse.created(res, 'User created successfully', { user });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requesterId = String(req.user._id);
  const requesterRole = req.user.role;

  // Regular user can only update own profile
  if (requesterRole === ROLES.USER && id !== requesterId) {
    throw new ApiError(403, 'You can only update your own profile');
  }

  const user = await userService.updateUser(id, req.body, requesterId, requesterRole);
  ApiResponse.success(res, 'User updated successfully', { user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, String(req.user._id));
  ApiResponse.success(res, 'User deleted successfully');
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.toggleStatus(req.params.id, String(req.user._id));
  ApiResponse.success(res, `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`, { user });
});

module.exports = { getStats, listUsers, getUser, createUser, updateUser, deleteUser, toggleUserStatus };
