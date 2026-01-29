const db = require('./config/db');

async function run() {
    try {
        console.log('Adding unique constraint to store_ratings...');
        await db.query(`
            ALTER TABLE store_ratings 
            ADD CONSTRAINT store_ratings_user_id_store_id_key UNIQUE (user_id, store_id);
        `);
        console.log('Constraint added successfully.');
    } catch (err) {
        console.error('Error adding constraint:', err);
    } finally {
        if (db.pool) {
            db.pool.end();
        } else {
            console.log('Pool not closed');
            process.exit(0);
        }
    }
}

run();
