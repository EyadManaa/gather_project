const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration for performance metrics...');

        // 1. Add order_count to stores
        try {
            await db.execute('ALTER TABLE stores ADD COLUMN order_count INT DEFAULT 0');
            console.log('Added order_count column to stores');
        } catch (e) {
            console.log('order_count column already exists or error:', e.message);
        }

        // 2. Add sales_count to products
        try {
            await db.execute('ALTER TABLE products ADD COLUMN sales_count INT DEFAULT 0');
            console.log('Added sales_count column to products');
        } catch (e) {
            console.log('sales_count column already exists or error:', e.message);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
