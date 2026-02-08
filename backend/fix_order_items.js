const db = require('./config/db');

async function fix() {
    try {
        console.log('Dropping incorrect order_items table...');
        await db.execute('DROP TABLE IF EXISTS order_items CASCADE');

        console.log('Creating correct order_items table...');
        await db.execute(`
            CREATE TABLE order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                quantity INTEGER DEFAULT 1,
                price_at_purchase DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Fix applied successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err);
        process.exit(1);
    }
}
fix();
