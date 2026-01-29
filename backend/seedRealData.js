const db = require('./config/db');

async function seed() {
    try {
        console.log('--- Starting Data Seed ---');

        // 1. Update Admin Addresses
        await db.execute('UPDATE users SET address = "123 Emerald St, Green City, GC 12345" WHERE role = "admin" AND (address IS NULL OR address = "")');
        console.log('Updated admin addresses');

        // 2. Get some stores and users to create orders
        const [stores] = await db.execute('SELECT id FROM stores LIMIT 5');
        const [users] = await db.execute('SELECT id FROM users WHERE role = "user" LIMIT 5');

        if (stores.length === 0 || users.length === 0) {
            console.log('Not enough users or stores to seed orders.');
            process.exit(0);
        }

        // 3. Create ~20 orders over the last 14 days
        console.log('Seeding 20 orders...');
        for (let i = 0; i < 20; i++) {
            const store = stores[Math.floor(Math.random() * stores.length)];
            const user = users[Math.floor(Math.random() * users.length)];
            const amount = (Math.random() * 100 + 20).toFixed(2);

            // Random date in the last 14 days
            const daysAgo = Math.floor(Math.random() * 14);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            const dateStr = date.toISOString().slice(0, 19).replace('T', ' ');

            await db.execute(
                'INSERT INTO orders (user_id, store_id, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?)',
                [user.id, store.id, amount, 'completed', dateStr]
            );
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
