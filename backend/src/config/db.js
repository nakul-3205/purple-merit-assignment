const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected → ${conn.connection.host} / ${conn.connection.name}`);
    await seedDefaultAdmin();
  } catch (err) {
    logger.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};

const seedDefaultAdmin = async () => {
  try {
    const User = require('../models/User');
    const { ROLES, STATUS } = require('../constants/roles');
    const adminExists = await User.findOne({ role: ROLES.ADMIN });
    if (adminExists) return;

    await User.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: ROLES.ADMIN,
      status: STATUS.ACTIVE,
    });
    logger.info('Default admin seeded → ' + (process.env.ADMIN_EMAIL || 'admin@example.com'));
  } catch (err) {
    logger.error('Admin seeding failed:', err);
  }
};

module.exports = { connectDB };
