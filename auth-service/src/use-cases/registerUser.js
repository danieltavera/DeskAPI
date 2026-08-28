const bcrypt = require('bcryptjs');
const userRepository = require('../interfaces/repositories/userRepository');
const AppError = require('./AppError');

async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new AppError('Name, email and password are required', 400); // 400 Bad Request - Missing fields
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError('Email already registered', 409); // 409 Conflict - Email already exists
  }

  const passwordHash = await bcrypt.hash(password, 10);
  // role is always 'user' here — never trust the client to set it
  const user = await userRepository.create({ name, email, passwordHash, role: 'user' });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

module.exports = registerUser;
