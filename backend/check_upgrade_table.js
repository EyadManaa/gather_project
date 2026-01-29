const db = require('./config/db');

async function check() {
    try {
        console.log('Checking for upgrade_requests table...');
        const res = await db.query("SELECT * FROM information_schema.tables WHERE table_name = 'upgrade_requests'");
        console.log('Table exists:', res.rows.length > 0);

        if (res.rows.length > 0) {
            const columns = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'upgrade_requests'");
            console.log('Columns:', columns.rows);
        }

    } catch (err) {
        console.error('Error checking table:', err);
    } finally {
        if (db.pool) {
            db.pool.end();
        } else {
            process.exit(0);
        }
    }
}

check();
