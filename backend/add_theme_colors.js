const db = require('./config/db');

async function addThemeColors() {
    try {
        console.log('Adding primary_color and secondary_color columns to stores table...');

        await db.execute(`
            ALTER TABLE stores 
            ADD COLUMN IF NOT EXISTS primary_color VARCHAR(50) DEFAULT '#10b981',
            ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(50) DEFAULT '#d1fae5';
        `);

        console.log('Successfully added theme color columns.');
    } catch (err) {
        console.error('Error adding columns:', err);
    } finally {
        process.exit();
    }
}

addThemeColors();
