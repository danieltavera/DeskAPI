const { Pool } = require('pg');

// connection pool for PostgreSQL database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool;
