const pool = require('../../infrastructure/db/pool');
const LogEntry = require('../../entities/LogEntry');

function mapRow(row) {
  return new LogEntry({
    id: row.id,
    event: row.event,
    userId: row.user_id,
    message: row.message,
    date: row.created_at,
  });
}

// no FK to users on purpose — logs must survive even if the referenced user is later deleted
async function create({ event, userId, message }) {
  const { rows } = await pool.query(
    `INSERT INTO logs (event, user_id, message) VALUES ($1, $2, $3) RETURNING *`,
    [event, userId || null, message]
  );
  return mapRow(rows[0]);
}

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM logs ORDER BY created_at DESC');
  return rows.map(mapRow);
}

module.exports = { create, findAll };
