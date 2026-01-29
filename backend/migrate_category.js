const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration: Add category to stores...');
        try {
            await db.execute('ALTER TABLE stores ADD COLUMN category VARCHAR(100) DEFAULT "General"');
            console.log('Added category column to stores');
        } catch (e) {
            console.log('Category column already exists or error:', e.message);
        }
        console.log('Migration completed');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
