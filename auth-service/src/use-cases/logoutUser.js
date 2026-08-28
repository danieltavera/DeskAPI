const refreshTokenRepository = require('../interfaces/repositories/refreshTokenRepository');

async function logoutUser(currentUser) {
  await refreshTokenRepository.removeAllForUser(currentUser.sub);
}

module.exports = logoutUser;
