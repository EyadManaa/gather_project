const db = require('./config/db');

async function checkSchema() {
    try {
        console.log('--- USERS ---');
        const users = await db.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.table(users.rows);

        console.log('--- STORES ---');
        const stores = await db.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'stores'");
        console.table(stores.rows);

        console.log('--- PRODUCTS ---');
        const prods = await db.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
        console.table(prods.rows);

        const storeData = await db.execute("SELECT id FROM stores LIMIT 5");
        console.log('Sample Store IDs:', storeData.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
