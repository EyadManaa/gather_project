const db = require('../config/db');

// Get active users for a store
exports.getStoreUsers = async (req, res) => {
    const storeId = req.params.storeId;
    const search = req.query.search || '';

    try {
        // Verify ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0 && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Aggregate user activity: orders, reviews, visits
        // We use a query that finds all users who have interacted with this store
        const { rows: users } = await db.execute(
            `SELECT 
                u.id, u.username, u.email,
                (SELECT COUNT(*) FROM orders WHERE user_id = u.id AND store_id = $1) as order_count,
                (SELECT COUNT(*) FROM reviews WHERE user_id = u.id AND store_id = $2) as review_count,
                (SELECT COUNT(*) FROM store_visits WHERE user_id = u.id AND store_id = $3) as visit_count,
                EXISTS(SELECT 1 FROM store_bans WHERE user_id = u.id AND store_id = $4) as is_banned,
                (SELECT MAX(visited_at) FROM store_visits WHERE user_id = u.id AND store_id = $5) as last_visit
             FROM users u
             WHERE (u.username ILIKE $6 OR u.email ILIKE $7)
             AND u.role != 'super_admin'
             AND u.id != (SELECT owner_id FROM stores WHERE id = $8)
             AND (
                EXISTS(SELECT 1 FROM orders WHERE user_id = u.id AND store_id = $9) OR
                EXISTS(SELECT 1 FROM reviews WHERE user_id = u.id AND store_id = $10) OR
                EXISTS(SELECT 1 FROM store_visits WHERE user_id = u.id AND store_id = $11)
             )
             ORDER BY last_visit DESC`,
            [storeId, storeId, storeId, storeId, storeId, `%${search}%`, `%${search}%`, storeId, storeId, storeId, storeId]
        );

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching store users' });
    }
};

// Ban user from store
exports.banUserFromStore = async (req, res) => {
    const { storeId, userId } = req.body;

    try {
        // Verify ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0 && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await db.execute('INSERT INTO store_bans (user_id, store_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, storeId]);
        res.json({ message: 'User banned from store' });
    } catch (err) {
        res.status(500).json({ message: 'Error banning user' });
    }
};

// Unban user from store
exports.unbanUserFromStore = async (req, res) => {
    const { storeId, userId } = req.body;

    try {
        // Verify ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0 && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await db.execute('DELETE FROM store_bans WHERE user_id = $1 AND store_id = $2', [userId, storeId]);
        res.json({ message: 'User unbanned from store' });
    } catch (err) {
        res.status(500).json({ message: 'Error unbanning user' });
    }
};

exports.checkBanStatus = async (req, res) => {
    const { storeId } = req.params;
    if (!req.user) return res.json({ isBanned: false });

    try {
        const { rows: bans } = await db.execute('SELECT * FROM store_bans WHERE user_id = $1 AND store_id = $2', [req.user.id, storeId]);
        res.json({ isBanned: bans.length > 0 });
    } catch (err) {
        res.status(500).json({ message: 'Error checking ban status' });
    }
};

