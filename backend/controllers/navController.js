const db = require('../config/db');

exports.getStoreNav = async (req, res) => {
    try {
        const { rows: navItems } = await db.execute(
            'SELECT * FROM store_nav_sections WHERE store_id = $1 ORDER BY order_index ASC',
            [req.params.storeId]
        );
        res.json(navItems);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching nav items' });
    }
};

exports.addStoreNav = async (req, res) => {
    const { label, section_id, order_index } = req.body;
    const storeId = req.params.storeId;

    try {
        // Verify ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0 && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get count for order_index
        const { rows: countRows } = await db.execute('SELECT COUNT(*) as count FROM store_nav_sections WHERE store_id = $1', [storeId]);
        const count = countRows[0].count;

        await db.execute(
            'INSERT INTO store_nav_sections (store_id, label, section_id, order_index) VALUES ($1, $2, $3, $4)',
            [storeId, label, section_id, count]
        );
        res.status(201).json({ message: 'Nav item added' });

    } catch (err) {
        res.status(500).json({ message: 'Error adding nav item' });
    }
};

exports.deleteStoreNav = async (req, res) => {
    try {
        // Verify ownership through join
        const { rows: navItem } = await db.execute(
            `SELECT n.* FROM store_nav_sections n 
             JOIN stores s ON n.store_id = s.id 
             WHERE n.id = $1 AND (s.owner_id = $2 OR $3 = 'super_admin')`,
            [req.params.navId, req.user.id, req.user.role]
        );

        if (navItem.length === 0) {
            return res.status(403).json({ message: 'Not authorized or item not found' });
        }

        await db.execute('DELETE FROM store_nav_sections WHERE id = $1', [req.params.navId]);
        res.json({ message: 'Nav item deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting nav item' });
    }
};

exports.updateStoreNav = async (req, res) => {
    const { label, section_id, order_index } = req.body;
    try {
        const { rows: navItems } = await db.execute(
            `SELECT n.* FROM store_nav_sections n 
             JOIN stores s ON n.store_id = s.id 
             WHERE n.id = $1 AND (s.owner_id = $2 OR $3 = 'super_admin')`,
            [req.params.navId, req.user.id, req.user.role]
        );

        if (navItems.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const item = navItems[0];
        await db.execute(
            'UPDATE store_nav_sections SET label = $1, section_id = $2, order_index = $3 WHERE id = $4',
            [label || item.label, section_id || item.section_id, order_index !== undefined ? order_index : item.order_index, req.params.navId]
        );
        res.json({ message: 'Nav item updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating nav item' });
    }
};

