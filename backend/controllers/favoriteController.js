const db = require('../config/db');

exports.toggleFavorite = async (req, res) => {
    const { storeId } = req.body;
    const userId = req.user.id;

    try {
        // Check if already favorited
        const { rows: existing } = await db.query('SELECT * FROM favorites WHERE user_id = $1 AND store_id = $2', [userId, storeId]);

        if (existing.length > 0) {
            // Remove from favorites
            await db.query('DELETE FROM favorites WHERE user_id = $1 AND store_id = $2', [userId, storeId]);
            return res.status(200).json({ message: 'Removed from favorites', isFavorite: false });
        } else {
            // Add to favorites
            await db.query('INSERT INTO favorites (user_id, store_id) VALUES ($1, $2)', [userId, storeId]);
            return res.status(200).json({ message: 'Added to favorites', isFavorite: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFavorites = async (req, res) => {
    const userId = req.user.id;
    try {
        const { rows } = await db.query(`
            SELECT s.* 
            FROM stores s
            JOIN favorites f ON s.id = f.store_id
            WHERE f.user_id = $1
        `, [userId]);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.checkFavorite = async (req, res) => {
    const { storeId } = req.params;
    const userId = req.user.id;
    try {
        const { rows } = await db.query('SELECT * FROM favorites WHERE user_id = $1 AND store_id = $2', [userId, storeId]);
        res.status(200).json({ isFavorite: rows.length > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
