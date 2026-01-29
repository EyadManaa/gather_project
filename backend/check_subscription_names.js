const db = require('./config/db');

async function check() {
    try {
        console.log('Checking subscription names...');
        const res = await db.query("SELECT name FROM subscriptions");
        console.log('Subscription Names:', res.rows.map(r => r.name));
    } catch (err) {
        console.error('Error checking subscriptions:', err);
    } finally {
        if (db.pool) {
            db.pool.end();
        } else {
            process.exit(0);
        }
    }
}

check();
