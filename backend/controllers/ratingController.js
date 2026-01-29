const db = require('../config/db');

// Add or Update a rating
exports.submitRating = async (req, res) => {
    const { storeId, score } = req.body;
    const userId = req.user.id;

    if (!score || score < 1 || score > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        await db.execute(
            'INSERT INTO store_ratings (user_id, store_id, score) VALUES ($1, $2, $3) ON CONFLICT (user_id, store_id) DO UPDATE SET score = EXCLUDED.score',
            [userId, storeId, score]
        );
        res.json({ message: 'Rating submitted successfully' });
    } catch (err) {
        console.error('Error submitting rating:', err);
        res.status(500).json({ message: 'Error submitting rating' });
    }
};

// Get current user's rating for a store
exports.getUserRating = async (req, res) => {
    const { storeId } = req.params;
    const userId = req.user.id;

    try {
        const { rows } = await db.execute(
            'SELECT score FROM store_ratings WHERE user_id = $1 AND store_id = $2',
            [userId, storeId]
        );
        res.json({ rating: rows.length > 0 ? rows[0].score : null });
    } catch (err) {
        console.error('Error fetching user rating:', err);
        res.status(500).json({ message: 'Error fetching user rating' });
    }
};

// Get global rating statistics for a store
exports.getRatingStats = async (req, res) => {
    const { storeId } = req.params;

    try {
        const { rows } = await db.execute(
            'SELECT score, COUNT(*) as count FROM store_ratings WHERE store_id = $1 GROUP BY score',
            [storeId]
        );

        // Initialize stats with 0 for all scores 1-5
        const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0, average: 0 };
        let sum = 0;

        rows.forEach(row => {
            stats[row.score] = row.count;
            stats.total += row.count;
            sum += (row.score * row.count);
        });

        if (stats.total > 0) {
            stats.average = (sum / stats.total).toFixed(1);
        }

        res.json(stats);
    } catch (err) {
        console.error('Error fetching rating stats:', err);
        res.status(500).json({ message: 'Error fetching rating stats' });
    }
};
