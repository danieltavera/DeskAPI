const pool = require('../../infrastructure/db/pool');
const ResourceType = require('../../entities/ResourceType');

function mapRow(row) {
  return new ResourceType({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  });
}

async function findByName(name) {
  const { rows } = await pool.query('SELECT * FROM resource_types WHERE name = $1', [name]);
  return rows[0] ? mapRow(rows[0]) : null;
}

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM resource_types ORDER BY name ASC');
  return rows.map(mapRow);
}

async function create(name) {
  const { rows } = await pool.query(
    `INSERT INTO resource_types (name) VALUES ($1) RETURNING *`,
    [name]
  );
  return mapRow(rows[0]);
}

// the "search or create the type automatically" flow decided during design
// name is normalized (trim + lowercase) so "Room", "room " and "ROOM" never become 3 different types
async function findOrCreate(rawName) {
  const name = rawName.trim().toLowerCase();
  const existing = await findByName(name);
  if (existing) return existing;
  return create(name);
}

module.exports = { findByName, findAll, create, findOrCreate };
