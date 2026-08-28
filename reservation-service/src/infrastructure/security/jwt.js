const jwt = require('jsonwebtoken');

// reservation-service only verifies tokens issued by auth-service — it never signs its own
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { verifyAccessToken };
