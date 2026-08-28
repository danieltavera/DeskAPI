const pool = require('../../infrastructure/db/pool');

async function create({ userId, tokenHash, expiresAt }) {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

// wipes every leftover refresh token for this user on logout, keeping the table clean
async function removeAllForUser(userId) {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

module.exports = { create, removeAllForUser };
