const db = require('./config/db');

async function check() {
    try {
        console.log('Checking for store_ratings table...');
        const res = await db.query("SELECT * FROM information_schema.tables WHERE table_name = 'store_ratings'");
        console.log('Table exists:', res.rows.length > 0);

        if (res.rows.length > 0) {
            const columns = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'store_ratings'");
            console.log('Columns:', columns.rows);
        }

    } catch (err) {
        console.error('Error checking table:', err);
    } finally {
        // We need to access the pool directly to end it, assuming db.js exports pool or we just let it hang (run_command will timeout/kill it if I don't end it, but better to end)
        if (db.pool) {
            db.pool.end();
        } else {
            console.log('Could not close pool, process may hang briefly');
            process.exit(0);
        }
    }
}

check();
