const db = require('./config/db');

async function addBackgroundColor() {
    try {
        console.log('Adding background_color column to stores table...');

        await db.execute(`
            ALTER TABLE stores 
            ADD COLUMN IF NOT EXISTS background_color VARCHAR(50) DEFAULT '#ffffff';
        `);

        console.log('Successfully added background_color column.');
    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        // We don't close the pool here because it might be used by the app, 
        // but for a script it's fine to just exit or let the process finish.
        // If db.end is available:
        // await db.end(); 
        process.exit();
    }
}

addBackgroundColor();
