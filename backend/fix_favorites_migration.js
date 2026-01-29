const db = require('./config/db');

async function run() {
    try {
        console.log('Dropping existing favorites table...');
        await db.execute('DROP TABLE IF EXISTS favorites CASCADE');

        console.log('Creating new favorites table with UUIDs...');
        await db.execute(`
            CREATE TABLE favorites (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, store_id)
            )
        `);

        console.log('Favorites table recreated successfully!');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        process.exit();
    }
}

run();
