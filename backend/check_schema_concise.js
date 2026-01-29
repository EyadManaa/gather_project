const db = require('./config/db');

async function checkSchema() {
    try {
        const tables = ['users', 'stores', 'products'];
        for (const table of tables) {
            console.log(`--- ${table.toUpperCase()} ---`);
            const res = await db.execute(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            res.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
