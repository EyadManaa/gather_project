const db = require('./config/db');

async function migrate() {
    try {
        console.log('Adding duration_days column...');
        await db.query("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30;");
        console.log('Successfully added duration_days column.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
