const db = require('./config/db');

async function debug() {
    try {
        console.log('--- Orders Table Schema ---');
        const { rows: columns } = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'orders'
            ORDER BY ordinal_position;
        `);
        console.table(columns);

        console.log('\n--- Order Items Table Schema ---');
        const { rows: itemColumns } = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'order_items'
            ORDER BY ordinal_position;
        `);
        console.table(itemColumns);

        console.log('\n--- Products Table Schema ---');
        const { rows: prodColumns } = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'products'
            ORDER BY ordinal_position;
        `);
        console.table(prodColumns);

        process.exit(0);
    } catch (err) {
        console.error('Debug failed:', err);
        process.exit(1);
    }
}

debug();
