const axios = require('axios');

// fire-and-forget: logging must never block or break the main request flow
function logEvent(event, userId, message) {
  const baseUrl = process.env.ACTIVITY_API_URL || 'http://localhost:3003';
  axios.post(`${baseUrl}/api/logs`, { event, userId, message }).catch((err) => {
    console.warn('Could not log activity event:', err.message);
  });
}

module.exports = { logEvent };
