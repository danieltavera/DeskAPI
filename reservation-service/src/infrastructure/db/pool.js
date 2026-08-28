const { Pool } = require('pg');

// same Postgres database as auth-service (shared DATABASE_URL from the root .env)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool;
