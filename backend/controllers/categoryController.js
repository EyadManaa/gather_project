const db = require('../config/db');

exports.getCategories = async (req, res) => {
    try {
        const { rows } = await db.execute("SELECT DISTINCT category FROM stores WHERE category IS NOT NULL AND category != ''");

        // Format for Flutter app (expects {id, name})
        const categories = rows.map((row, index) => ({
            id: row.category, // Using name as ID for filtering simplicity
            name: row.category,
            icon: null
        }));

        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};
