const db = require('./config/db');

async function check() {
    try {
        console.log('Checking subscription_tier enum...');
        const res = await db.query(`
            SELECT enum_range(NULL::subscription_tier)
        `);
        console.log('Enum values:', res.rows[0]);

        console.log('Checking request_status enum...');
        const res2 = await db.query(`
            SELECT enum_range(NULL::request_status)
        `);
        console.log('Enum values:', res2.rows[0]);

    } catch (err) {
        console.error('Error checking enums:', err);
    } finally {
        if (db.pool) {
            db.pool.end();
        } else {
            process.exit(0);
        }
    }
}

check();
