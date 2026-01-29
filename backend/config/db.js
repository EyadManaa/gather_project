const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase/PostgreSQL connections over the internet
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    execute: (text, params) => pool.query(text, params), // maintain 'execute' alias for convenience
    pool
};
