const db = require('./config/db');

async function updateSchema() {
    try {
        console.log('Updating schema...');

        // Add columns if they don't exist
        // Note: IF NOT EXISTS is not standard in ADD COLUMN for all MySQL versions, 
        // so we'll wrap in try-catch or execute carefully. 
        // A cleaner way for a one-off script is to just try adding them.

        const queries = [
            "ALTER TABLE stores ADD COLUMN instagram_link VARCHAR(255)",
            "ALTER TABLE stores ADD COLUMN tiktok_link VARCHAR(255)",
            "ALTER TABLE stores ADD COLUMN facebook_link VARCHAR(255)",
            "ALTER TABLE stores ADD COLUMN linkedin_link VARCHAR(255)"
        ];

        for (const query of queries) {
            try {
                await db.query(query);
                console.log(`Executed: ${query}`);
            } catch (err) {
                // Ignore "duplicate column name" errors (code 1060 in MySQL)
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipped (already exists): ${query}`);
                } else {
                    console.error(`Error executing ${query}:`, err.message);
                }
            }
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

updateSchema();
