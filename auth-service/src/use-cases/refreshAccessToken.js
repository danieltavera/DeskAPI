const userRepository = require('../interfaces/repositories/userRepository');
const refreshTokenRepository = require('../interfaces/repositories/refreshTokenRepository');
const { verifyRefreshToken, signAccessToken, hashToken } = require('../infrastructure/security/jwt');
const AppError = require('./AppError');

async function refreshAccessToken({ refreshToken }) {
  if (!refreshToken) {
    throw new AppError('refreshToken is required', 400);
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // must also exist (and not be revoked/expired) in the DB — logout deletes rows here,
  // so a logged-out refresh token fails even if its JWT signature is still technically valid
  const storedToken = await refreshTokenRepository.findByHash(hashToken(refreshToken));
  if (!storedToken || storedToken.revoked || new Date(storedToken.expires_at) < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await userRepository.findById(payload.sub);
  if (!user) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const accessToken = signAccessToken(user);
  return { accessToken };
}

module.exports = refreshAccessToken;
