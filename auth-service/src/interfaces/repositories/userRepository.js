const pool = require('../../infrastructure/db/pool');
const User = require('../../entities/User');

// Data Access Layer. It only runs SQL queries (SELECT, INSERT). No logic, no validation.

function mapRow(row) {
  return new User({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  });
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] ? mapRow(rows[0]) : null;
}

async function create({ name, email, passwordHash, role }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, passwordHash, role]
  );
  return mapRow(rows[0]);
}

module.exports = { findByEmail, create };
