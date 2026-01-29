const db = require('./config/db');

async function check() {
    try {
        const [users] = await db.execute('SELECT id, username, email, role FROM users WHERE email = "superadmin@gther.com"');
        console.log('User found:', JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error checking user:', err.message);
        process.exit(1);
    }
}

check();
