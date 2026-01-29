const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Add address to users
        try {
            await db.execute('ALTER TABLE users ADD COLUMN address TEXT');
            console.log('Added address column to users');
        } catch (e) {
            console.log('Address column already exists or error:', e.message);
        }

        // 2. Add subscription_tier to stores
        try {
            await db.execute('ALTER TABLE stores ADD COLUMN subscription_tier ENUM("basic", "pro", "enterprise") DEFAULT "basic"');
            console.log('Added subscription_tier column to stores');
        } catch (e) {
            console.log('subscription_tier column already exists or error:', e.message);
        }

        // 3. Create subscriptions table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS subscriptions (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(50) NOT NULL,
              price DECIMAL(10, 2) NOT NULL,
              features TEXT,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Subscriptions table checked/created');

        // 4. Seed subscriptions if empty
        const [existing] = await db.execute('SELECT COUNT(*) as count FROM subscriptions');
        if (existing[0].count === 0) {
            await db.execute(`
                INSERT INTO subscriptions (name, price, features) VALUES 
                ('Basic', 0.00, '10 Products, Basic Analytics, Standard Support'),
                ('Pro', 29.00, 'Unlimited Products, Advanced Analytics, Priority Support, Custom Domain'),
                ('Enterprise', 99.00, 'Everything in Pro, Dedicated Manager, API Access')
            `);
            console.log('Subscriptions seeded');
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
