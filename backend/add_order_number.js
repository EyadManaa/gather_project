const db = require('./config/db');

async function migrate() {
    try {
        console.log('Adding order_number column...');
        await db.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number SERIAL;");
        console.log('Successfully added order_number column.');

        // Optional: Restart sequence at 1000 for nicer looking order numbers
        await db.query("ALTER SEQUENCE IF EXISTS orders_order_number_seq RESTART WITH 1000;");
        console.log('Sequence restarted at 1000.');

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
