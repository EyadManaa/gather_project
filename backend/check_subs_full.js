const db = require('./config/db');

async function checkSchema() {
    try {
        const res = await db.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'subscriptions'
            ORDER BY ordinal_position;
        `);
        console.log('--- COLUMNS START ---');
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
        console.log('--- COLUMNS END ---');
        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
