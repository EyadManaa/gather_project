const db = require('./config/db');

async function fix() {
    try {
        console.log("Adding 'enterprise' to subscription_tier enum...");
        // ALTER TYPE defines a new value for the enum
        await db.query("ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'enterprise'");
        console.log("Value 'enterprise' added successfully.");
    } catch (err) {
        console.error('Error fixing enum:', err);
    } finally {
        if (db.pool) {
            db.pool.end();
        } else {
            process.exit(0);
        }
    }
}

fix();
