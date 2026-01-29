const db = require('../config/db');

// Get all subscription packages (public)
exports.getSubscriptions = async (req, res) => {
    try {
        const { rows: subs } = await db.execute('SELECT * FROM subscriptions ORDER BY price ASC');
        res.json(subs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching subscriptions' });
    }
};
