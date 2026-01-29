const db = require('./config/db');

async function audit() {
    try {
        const queries = {
            users: 'SELECT COUNT(*) as count FROM users',
            admins: "SELECT COUNT(*) as count FROM users WHERE role = 'admin'",
            stores: 'SELECT COUNT(*) as count FROM stores',
            orders: 'SELECT COUNT(*) as count, SUM(total_amount) as gmv FROM orders',
            completed_orders: "SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM orders WHERE status = 'completed'",
            subs: 'SELECT * FROM subscriptions',
            owners_with_address: "SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND address IS NOT NULL AND address != ''"
        };

        const results = {};
        for (const [key, sql] of Object.entries(queries)) {
            const { rows } = await db.execute(sql);
            results[key] = rows[0];
        }

        console.log('--- Database Audit ---');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Audit failed:', err.message);
        process.exit(1);
    }
}

audit();
