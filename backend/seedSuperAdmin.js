const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seed() {
    try {
        const password = 'super12345';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Clear existing super admins just in case
        await db.execute('DELETE FROM users WHERE email IN ("superadmin@gther.com", "superadmin@gather.com")');

        // Seed with the exact requested one
        await db.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            ['SuperAdmin', 'superadmin@gther.com', hashedPassword, 'super_admin']
        );

        // Also seed with the likely intended one
        await db.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            ['SuperAdminFixed', 'superadmin@gather.com', hashedPassword, 'super_admin']
        );

        console.log('Super Admin accounts seeded successfully (gther.com and gather.com)');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

seed();
