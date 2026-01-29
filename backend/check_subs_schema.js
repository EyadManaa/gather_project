const db = require('./config/db');

async function checkSchema() {
    try {
        const res = await db.query(`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_name = 'subscriptions';
        `);
        console.log('Columns:');
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} (${r.udt_name})`));
        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
