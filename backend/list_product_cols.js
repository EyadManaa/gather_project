const db = require('./config/db');

async function check() {
    try {
        const res = await db.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'");
        console.log('Columns:', res.rows.map(r => r.column_name));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
