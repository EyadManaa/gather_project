const db = require('./config/db');

async function check() {
    try {
        console.log('Checking stores subscription_tier...');
        const res = await db.query("SELECT id, subscription_tier FROM stores LIMIT 5");
        console.log('Stores:', res.rows);
    } catch (err) {
        console.error('Error checking stores:', err);
    } finally {
        if (db.pool) {
            db.pool.end();
        } else {
            process.exit(0);
        }
    }
}

check();
