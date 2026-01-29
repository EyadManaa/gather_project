const db = require('./config/db');

async function check() {
    try {
        console.log('Checking for constraints on store_ratings...');
        const res = await db.query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c 
            JOIN pg_namespace n ON n.oid = c.connamespace 
            WHERE conrelid = 'public.store_ratings'::regclass
        `);
        console.log('Constraints:', res.rows);
    } catch (err) {
        console.error('Error checking constraints:', err);
    } finally {
        if (db.pool) {
            db.pool.end();
        } else {
            process.exit(0);
        }
    }
}

check();
