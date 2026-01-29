const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const sql = fs.readFileSync(path.join(__dirname, 'ultimate_uuid_fix.sql'), 'utf8');
    try {
        console.log('Starting ultimate migration...');
        await db.execute(sql);
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
