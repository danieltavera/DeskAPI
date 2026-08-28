const pool = require('../../infrastructure/db/pool');
const Booking = require('../../entities/Booking');

function mapRow(row) {
  return new Booking({
    id: row.id,
    userId: row.user_id,
    resourceId: row.resource_id,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    createdAt: row.created_at,
  });
}

async function findByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM bookings WHERE user_id = $1 ORDER BY start_time DESC',
    [userId]
  );
  return rows.map(mapRow);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

// two ranges [start1,end1) and [start2,end2) overlap when start1 < end2 AND start2 < end1
async function hasOverlap({ resourceId, startTime, endTime, excludeBookingId }) {
  const { rows } = await pool.query(
    `SELECT id FROM bookings
     WHERE resource_id = $1
       AND start_time < $3
       AND end_time > $2
       AND ($4::int IS NULL OR id != $4)`,
    [resourceId, startTime, endTime, excludeBookingId || null]
  );
  return rows.length > 0;
}

async function create({ userId, resourceId, startTime, endTime }) {
  const { rows } = await pool.query(
    `INSERT INTO bookings (user_id, resource_id, start_time, end_time)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, resourceId, startTime, endTime]
  );
  return mapRow(rows[0]);
}

async function update(id, { startTime, endTime }) {
  const { rows } = await pool.query(
    `UPDATE bookings SET start_time = $2, end_time = $3 WHERE id = $1 RETURNING *`,
    [id, startTime, endTime]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

async function remove(id) {
  await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
}

module.exports = { findByUserId, findById, hasOverlap, create, update, remove };
