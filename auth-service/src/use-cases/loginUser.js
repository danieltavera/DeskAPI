const bcrypt = require('bcryptjs');
const userRepository = require('../interfaces/repositories/userRepository');
const refreshTokenRepository = require('../interfaces/repositories/refreshTokenRepository');
const { signAccessToken, signRefreshToken, hashToken } = require('../infrastructure/security/jwt');
const AppError = require('./AppError');

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError('Invalid credentials', 401);
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken };
}

module.exports = loginUser;
