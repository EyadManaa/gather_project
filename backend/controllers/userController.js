const db = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const { rows: users } = await db.execute('SELECT id, username, email, role, address FROM users WHERE id = $1', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: users[0]
        });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    const { address } = req.body;
    try {
        await db.execute('UPDATE users SET address = $1 WHERE id = $2', [address, req.user.id]);
        res.json({ message: 'Profile updated' });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
