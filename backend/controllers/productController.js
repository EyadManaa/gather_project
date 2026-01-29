const db = require('../config/db');
const { uploadToSupabase } = require('../utils/supabaseStorage');

exports.getProducts = async (req, res) => {
    const storeId = req.query.storeId;
    try {
        let sql = 'SELECT * FROM products';
        let params = [];
        if (storeId) {
            sql += ' WHERE store_id = $1';
            params.push(storeId);
        }
        const { rows: products } = await db.execute(sql, params);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { rows: products } = await db.execute('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (products.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(products[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product' });
    }
};

exports.createProduct = async (req, res) => {
    const { storeId, name, description, price, section } = req.body;

    try {
        const image = req.file ? await uploadToSupabase(req.file, 'products') : null;

        // Verify ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0 && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to add products to this store' });
        }

        const { rows } = await db.execute(
            'INSERT INTO products (store_id, name, description, price, image, section, is_out_of_stock) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [storeId, name, description, price, image, section || 'General', req.body.is_out_of_stock === 'true' || req.body.is_out_of_stock === true]
        );
        res.status(201).json({ message: 'Product created', productId: rows[0].id });
    } catch (err) {
        console.error('Create Product Error:', err);
        res.status(500).json({ message: 'Error creating product', error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;
    // In a real app we'd verify store ownership here too by joining tables, simplified for now
    try {
        await db.execute('DELETE FROM products WHERE id = $1', [productId]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('Delete Product Error:', err);
        res.status(500).json({ message: 'Error deleting product', error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    const { name, description, price, section } = req.body;
    const productId = req.params.id;

    try {
        // Find existing product and check ownership
        const { rows: products } = await db.execute(
            `SELECT p.* FROM products p 
             JOIN stores s ON p.store_id = s.id 
             WHERE p.id = $1 AND (s.owner_id = $2 OR $3 = 'super_admin')`,
            [productId, req.user.id, req.user.role]
        );

        if (products.length === 0) {
            return res.status(403).json({ message: 'Not authorized or product not found' });
        }

        const product = products[0];
        const image = req.file ? await uploadToSupabase(req.file, 'products') : product.image;
        const out_of_stock = req.body.is_out_of_stock !== undefined ? (req.body.is_out_of_stock === 'true' || req.body.is_out_of_stock === true) : product.is_out_of_stock;

        await db.execute(
            'UPDATE products SET name = $1, description = $2, price = $3, image = $4, section = $5, is_out_of_stock = $6 WHERE id = $7',
            [name || product.name, description || product.description, price || product.price, image, section || product.section, out_of_stock, productId]
        );

        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error('Update Product Error:', err);
        res.status(500).json({ message: 'Error updating product', error: err.message });
    }
};

exports.toggleStockStatus = async (req, res) => {
    const productId = req.params.id;
    try {
        const { rows: products } = await db.execute(
            `SELECT p.* FROM products p 
             JOIN stores s ON p.store_id = s.id 
             WHERE p.id = $1 AND (s.owner_id = $2 OR $3 = 'super_admin')`,
            [productId, req.user.id, req.user.role]
        );

        if (products.length === 0) {
            return res.status(403).json({ message: 'Not authorized or product not found' });
        }

        await db.execute('UPDATE products SET is_out_of_stock = NOT is_out_of_stock WHERE id = $1', [productId]);
        res.json({ message: 'Stock status toggled' });
    } catch (err) {
        res.status(500).json({ message: 'Error toggling stock status' });
    }
};

exports.getTrendingProducts = async (req, res) => {
    try {
        const { rows: products } = await db.execute('SELECT * FROM products WHERE is_out_of_stock = FALSE ORDER BY sales_count DESC, created_at DESC LIMIT 8');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching trending products' });
    }
};
