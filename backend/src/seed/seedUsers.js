/**
 * Seed script for Users collection
 * Usage: node backend/src/seed/seedUsers.js
 */
const mongoose = require('mongoose');
const User = require('../modules/user/user.model');
const { generatePrefixedUUID } = require('../utils/uuid');

const users = [
  {
    publicId: generatePrefixedUUID('USER'),
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '9999999999',
    role: 'admin',
    password: 'Admin@123', // Should be hashed in production
    visible: true,
    isDeleted: false,
    meta: {},
  },
  {
    publicId: generatePrefixedUUID('USER'),
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '8888888888',
    role: 'user',
    password: 'Test@123', // Should be hashed in production
    visible: true,
    isDeleted: false,
    meta: {},
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await User.deleteMany({});
  await User.insertMany(users);
  console.log('Users seeded successfully');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
