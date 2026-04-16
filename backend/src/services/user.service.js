const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../constants/roles');
const logger = require('../config/logger');

const listUsers = async ({ page = 1, limit = 10, search = '', role, status, sortBy = 'createdAt', order = 'desc' }) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const createUser = async (data, createdById) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ ...data, createdBy: createdById, updatedBy: createdById });
  logger.info(`User created: ${user.email} by ${createdById}`);
  return user;
};

const updateUser = async (id, data, requesterId, requesterRole) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  // Manager cannot update admins
  if (requesterRole === ROLES.MANAGER && user.role === ROLES.ADMIN) {
    throw new ApiError(403, 'Managers cannot modify admin accounts');
  }

  // Only admin can change roles or status
  if (requesterRole !== ROLES.ADMIN) {
    delete data.role;
    delete data.status;
  }

  // User cannot change their own role
  if (String(id) === String(requesterId)) {
    delete data.role;
  }

  if (data.email && data.email !== user.email) {
    const emailExists = await User.findOne({ email: data.email });
    if (emailExists) throw new ApiError(409, 'Email already in use');
  }

  Object.assign(user, data, { updatedBy: requesterId });
  await user.save();

  logger.info(`User updated: ${user.email} by ${requesterId}`);
  return user;
};

const deleteUser = async (id, requesterId) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  if (String(id) === String(requesterId)) throw new ApiError(400, 'Cannot delete your own account');

  await User.findByIdAndDelete(id);
  logger.info(`User deleted: ${user.email} by ${requesterId}`);
};

const toggleStatus = async (id, requesterId) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  if (String(id) === String(requesterId)) throw new ApiError(400, 'Cannot change your own status');

  user.status = user.status === 'active' ? 'inactive' : 'active';
  user.updatedBy = requesterId;
  await user.save({ validateBeforeSave: false });
  logger.info(`User status toggled: ${user.email} → ${user.status} by ${requesterId}`);
  return user;
};

const getStats = async () => {
  const [total, active, admins, managers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ role: ROLES.ADMIN }),
    User.countDocuments({ role: ROLES.MANAGER }),
  ]);
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role status createdAt');
  return { total, active, inactive: total - active, admins, managers, users: total - admins - managers, recentUsers };
};

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser, toggleStatus, getStats };
