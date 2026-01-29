const db = require('./config/db');

async function check() {
    try {
        console.log('--- START ENUM CHECK ---');
        const res = await db.query(`
            SELECT t.typname, e.enumlabel
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            WHERE t.typname = 'subscription_tier'
            ORDER BY e.enumsortorder;
        `);
        console.log('subscription_tier values:', res.rows.map(r => r.enumlabel));
        console.log('--- END ENUM CHECK ---');

    } catch (err) {
        console.error('Error checking enums:', err);
    } finally {
        if (db.pool) {
            db.pool.end();
        } else {
            console.log('Pool not closed');
            process.exit(0);
        }
    }
}

check();
