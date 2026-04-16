require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const logger = require('../src/config/logger');
const { ROLES, STATUS } = require('../src/constants/roles');

const users = [
  {
    name: 'Super Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: ROLES.ADMIN,
    status: STATUS.ACTIVE,
  },
  {
    name: 'Jane Manager',
    email: 'manager@example.com',
    password: 'Manager@123',
    role: ROLES.MANAGER,
    status: STATUS.ACTIVE,
  },
  {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'User@123',
    role: ROLES.USER,
    status: STATUS.ACTIVE,
  },
  {
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'Alice@123',
    role: ROLES.USER,
    status: STATUS.ACTIVE,
  },
  {
    name: 'Bob Jones',
    email: 'bob@example.com',
    password: 'Bob@123',
    role: ROLES.USER,
    status: STATUS.INACTIVE,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB for seeding');

    await User.deleteMany({});
    logger.info('Cleared existing users');

    const admin = await User.create(users[0]);

    for (let i = 1; i < users.length; i++) {
      await User.create({ ...users[i], createdBy: admin._id, updatedBy: admin._id });
    }

    logger.info('Seeding complete! Credentials:');
    users.forEach((u) => logger.info(`  ${u.role.padEnd(8)} | ${u.email} / ${u.password}`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    logger.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
