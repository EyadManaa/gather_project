const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        await db.execute('UPDATE users SET password = $1 WHERE email = $2', [hash, 'superadmin@gather.com']);
        console.log('Super Admin password reset successfully to: admin123');
    } catch (e) {
        console.error('Failed to reset password:', e);
    } finally {
        process.exit();
    }
}

run();
