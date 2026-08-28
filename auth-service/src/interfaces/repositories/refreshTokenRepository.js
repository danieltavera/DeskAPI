const pool = require('../../infrastructure/db/pool');

async function create({ userId, tokenHash, expiresAt }) {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

module.exports = { create };
