const db = require('../config/db');

exports.getSections = async (req, res) => {
    try {
        const { rows: sections } = await db.execute(
            'SELECT * FROM product_sections WHERE store_id = $1 ORDER BY order_index ASC',
            [req.params.storeId]
        );
        res.json(sections);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching sections' });
    }
};

exports.addSection = async (req, res) => {
    const { name } = req.body;
    const storeId = req.params.storeId;

    try {
        // Verify ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0 && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get count for order_index
        const { rows: countRows } = await db.execute('SELECT COUNT(*) as count FROM product_sections WHERE store_id = $1', [storeId]);
        const count = parseInt(countRows[0].count);

        const { rows: newSection } = await db.execute(
            'INSERT INTO product_sections (store_id, name, order_index) VALUES ($1, $2, $3) RETURNING *',
            [storeId, name, count]
        );
        res.status(201).json(newSection[0]);

    } catch (err) {
        res.status(500).json({ message: 'Error adding section' });
    }
};

exports.deleteSection = async (req, res) => {
    const sectionId = req.params.sectionId;
    try {
        // Verify ownership through join
        const { rows: section } = await db.execute(
            `SELECT ps.* FROM product_sections ps 
             JOIN stores s ON ps.store_id = s.id 
             WHERE ps.id = $1 AND (s.owner_id = $2 OR $3 = 'super_admin')`,
            [sectionId, req.user.id, req.user.role]
        );

        if (section.length === 0) {
            return res.status(403).json({ message: 'Not authorized or section not found' });
        }

        await db.execute('DELETE FROM product_sections WHERE id = $1', [sectionId]);
        res.json({ message: 'Section deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting section' });
    }
};

exports.updateSection = async (req, res) => {
    const { name, order_index } = req.body;
    const sectionId = req.params.sectionId;
    try {
        const { rows: sections } = await db.execute(
            `SELECT ps.* FROM product_sections ps 
             JOIN stores s ON ps.store_id = s.id 
             WHERE ps.id = $1 AND (s.owner_id = $2 OR $3 = 'super_admin')`,
            [sectionId, req.user.id, req.user.role]
        );

        if (sections.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const item = sections[0];
        const { rows: updatedSection } = await db.execute(
            'UPDATE product_sections SET name = $1, order_index = $2 WHERE id = $3 RETURNING *',
            [name || item.name, order_index !== undefined ? order_index : item.order_index, sectionId]
        );
        res.json(updatedSection[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error updating section' });
    }
};
