const pool = require('../../infrastructure/db/pool');
const Resource = require('../../entities/Resource');

function mapRow(row) {
  return new Resource({
    id: row.id,
    name: row.name,
    description: row.description,
    typeId: row.type_id,
    typeName: row.type_name,
    location: row.location,
    stateCode: row.state_code,
    status: row.status,
    attributes: row.attributes,
    createdBy: row.created_by,
    createdAt: row.created_at,
  });
}

const SELECT_WITH_TYPE = `
  SELECT r.*, rt.name AS type_name
  FROM resources r
  JOIN resource_types rt ON rt.id = r.type_id
`;

async function findAll() {
  const { rows } = await pool.query(`${SELECT_WITH_TYPE} ORDER BY r.created_at DESC`);
  return rows.map(mapRow);
}

async function findById(id) {
  const { rows } = await pool.query(`${SELECT_WITH_TYPE} WHERE r.id = $1`, [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

async function create({ name, description, typeId, location, stateCode, attributes, createdBy }) {
  const { rows } = await pool.query(
    `INSERT INTO resources (name, description, type_id, location, state_code, attributes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [name, description || null, typeId, location || null, stateCode || null, attributes || null, createdBy]
  );
  return findById(rows[0].id);
}

async function update(id, { name, description, location, stateCode, attributes, status }) {
  const { rows } = await pool.query(
    `UPDATE resources
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         location = COALESCE($4, location),
         state_code = COALESCE($5, state_code),
         attributes = COALESCE($6, attributes),
         status = COALESCE($7, status)
     WHERE id = $1
     RETURNING id`,
    [id, name, description, location, stateCode, attributes, status]
  );
  if (!rows[0]) return null;
  return findById(rows[0].id);
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM resources WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
