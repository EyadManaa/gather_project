const db = require('./config/db');

async function check() {
    try {
        console.log('Checking subscriptions table...');
        const res = await db.query("SELECT * FROM subscriptions");
        console.log('Subscriptions:', res.rows);
    } catch (err) {
        console.error('Error checking subscriptions:', err);
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
