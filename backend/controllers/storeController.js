const db = require('../config/db');
const { uploadToSupabase } = require('../utils/supabaseStorage');

const checkStoreAutoStatus = (store) => {
    if (!store.opening_time || !store.closing_time) return store.is_open;

    const now = new Date();
    // Get time in HH:MM:SS format comparable to DB TIME
    const currentH = now.getHours().toString().padStart(2, '0');
    const currentM = now.getMinutes().toString().padStart(2, '0');
    const currentS = now.getSeconds().toString().padStart(2, '0');
    const currentTime = `${currentH}:${currentM}:${currentS}`;

    let isOpenByTime = false;
    if (store.opening_time < store.closing_time) {
        isOpenByTime = currentTime >= store.opening_time && currentTime < store.closing_time;
    } else {
        // Overnight case
        isOpenByTime = currentTime >= store.opening_time || currentTime < store.closing_time;
    }

    return store.is_open && isOpenByTime;
};

// Create a new store (Admin/Owner)
exports.createStore = async (req, res) => {
    const { name, description, profit_percentage, about_content, instagram_link, tiktok_link, facebook_link, linkedin_link, category } = req.body;

    try {
        // Handle files - upload to Supabase
        const profile_pic = req.files && req.files['profile_pic'] ? await uploadToSupabase(req.files['profile_pic'][0], 'stores/profiles') : null;
        const banner = req.files && req.files['banner'] ? await uploadToSupabase(req.files['banner'][0], 'stores/banners') : null;

        const { rows } = await db.execute(
            'INSERT INTO stores (owner_id, name, description, profile_pic, banner, profit_percentage, is_open, about_content, instagram_link, tiktok_link, facebook_link, linkedin_link, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id',
            [req.user.id, name, description, profile_pic, banner, profit_percentage || 0, true, about_content || '', instagram_link || null, tiktok_link || null, facebook_link || null, linkedin_link || null, category || 'General']
        );
        res.status(201).json({ message: 'Store created successfully', storeId: rows[0].id });
    } catch (err) {
        const fs = require('fs');
        fs.appendFileSync('error.log', `${new Date().toISOString()} - Create Store Error: ${err.message}\nStack: ${err.stack}\n`);
        res.status(500).json({ message: 'Error creating store', error: err.message });
    }
};

// Get all stores (Public)
exports.getStores = async (req, res) => {
    try {
        const { rows: stores } = await db.execute(`
            SELECT s.*, 
                   COALESCE(AVG(sr.score), 0) as average_rating, 
                   (SELECT COUNT(*) FROM reviews WHERE store_id = s.id) as review_count 
            FROM stores s 
            LEFT JOIN store_ratings sr ON s.id = sr.store_id 
            WHERE s.is_banned = FALSE 
            GROUP BY s.id
        `);
        const enrichedStores = stores.map(s => ({
            ...s,
            is_open: checkStoreAutoStatus(s)
        }));
        res.json(enrichedStores);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stores' });
    }
};

exports.getFeaturedStores = async (req, res) => {
    try {
        const { rows: stores } = await db.execute(`
            SELECT s.*, 
                   COALESCE(AVG(sr.score), 0) as average_rating, 
                   (SELECT COUNT(*) FROM reviews WHERE store_id = s.id) as review_count 
            FROM stores s 
            LEFT JOIN store_ratings sr ON s.id = sr.store_id 
            WHERE s.is_banned = FALSE 
            GROUP BY s.id
            ORDER BY s.order_count DESC, s.visitors DESC
            LIMIT 4
        `);
        const enrichedStores = stores.map(s => ({
            ...s,
            is_open: checkStoreAutoStatus(s)
        }));
        res.json(enrichedStores);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching featured stores' });
    }
};

// Get my store (Owner)
exports.getMyStore = async (req, res) => {
    try {
        const { rows: stores } = await db.execute(`
            SELECT s.*, 
                   COALESCE(AVG(sr.score), 0) as average_rating, 
                   (SELECT COUNT(*) FROM reviews WHERE store_id = s.id) as review_count 
            FROM stores s 
            LEFT JOIN store_ratings sr ON s.id = sr.store_id 
            WHERE s.owner_id = $1 
            GROUP BY s.id
        `, [req.user.id]);

        if (stores.length === 0) return res.status(404).json({ message: 'No store found' });

        const store = stores[0];
        res.json({
            ...store,
            is_open_effective: checkStoreAutoStatus(store)
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching store' });
    }
};

// Update store
exports.updateStore = async (req, res) => {
    const { name, description, about_content, instagram_link, tiktok_link, facebook_link, linkedin_link, opening_time, closing_time, category } = req.body;
    const storeId = req.params.id;

    try {
        // Check ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0 && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const profile_pic = req.files && req.files['profile_pic'] ? await uploadToSupabase(req.files['profile_pic'][0], 'stores/profiles') : stores[0].profile_pic;
        const banner = req.files && req.files['banner'] ? await uploadToSupabase(req.files['banner'][0], 'stores/banners') : stores[0].banner;

        const is_open = req.body.is_open !== undefined ? (req.body.is_open === 'true' || req.body.is_open === true) : stores[0].is_open;

        await db.execute(
            'UPDATE stores SET name = $1, description = $2, profile_pic = $3, banner = $4, is_open = $5, about_content = $6, instagram_link = $7, tiktok_link = $8, facebook_link = $9, linkedin_link = $10, opening_time = $11, closing_time = $12, category = $13 WHERE id = $14',
            [
                name || stores[0].name,
                description || stores[0].description,
                profile_pic,
                banner,
                is_open,
                about_content !== undefined ? about_content : stores[0].about_content,
                instagram_link !== undefined ? instagram_link : stores[0].instagram_link,
                tiktok_link !== undefined ? tiktok_link : stores[0].tiktok_link,
                facebook_link !== undefined ? facebook_link : stores[0].facebook_link,
                linkedin_link !== undefined ? linkedin_link : stores[0].linkedin_link,
                opening_time !== undefined ? (opening_time === '' ? null : opening_time) : stores[0].opening_time,
                closing_time !== undefined ? (closing_time === '' ? null : closing_time) : stores[0].closing_time,
                category !== undefined ? category : stores[0].category,
                storeId
            ]
        );
        res.json({ message: 'Store updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating store' });
    }
};

// Delete store
exports.deleteStore = async (req, res) => {
    const storeId = req.params.id;
    try {
        // Check ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0 && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await db.execute('DELETE FROM stores WHERE id = $1', [storeId]);
        res.json({ message: 'Store deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting store' });
    }
};

// Get Store Stats
exports.getStoreStats = async (req, res) => {
    const storeId = req.params.id;
    try {
        // Check ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Count products
        const { rows: productCountRows } = await db.execute('SELECT COUNT(*) as productcount FROM products WHERE store_id = $1', [storeId]);
        const productCount = productCountRows[0].productcount;

        // Sum total income
        const { rows: incomeRows } = await db.execute('SELECT SUM(total_amount) as totalincome FROM orders WHERE store_id = $1', [storeId]);
        const totalIncome = incomeRows[0].totalincome;

        // Count active customers (unique users who placed orders)
        const { rows: customerRows } = await db.execute('SELECT COUNT(DISTINCT user_id) as activecustomers FROM orders WHERE store_id = $1', [storeId]);
        const activeCustomers = customerRows[0].activecustomers;

        res.json({
            productCount,
            income: totalIncome || 0,
            visitors: stores[0].visitors || 0,
            activeCustomers: activeCustomers || 0
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// Increment Visitors
exports.incrementVisitors = async (req, res) => {
    const storeId = req.params.id;
    try {
        await db.execute('UPDATE stores SET visitors = visitors + 1 WHERE id = $1', [storeId]);

        // Track specific user visit if logged in
        if (req.user && req.user.id) {
            await db.execute('INSERT INTO store_visits (user_id, store_id) VALUES ($1, $2)', [req.user.id, storeId]);
        }

        res.json({ message: 'Visitors incremented' });
    } catch (err) {
        res.status(500).json({ message: 'Error incrementing visitors' });
    }
};

// Get Store Income Stats (Daily, Monthly, Annual)
exports.getIncomeStats = async (req, res) => {
    const storeId = req.params.id;
    try {
        // Daily (last 14 days)
        const { rows: daily } = await db.execute(
            `SELECT TO_CHAR(created_at, 'Mon DD') as label, SUM(total_amount) as value 
             FROM orders 
             WHERE store_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '13 days'
             GROUP BY DATE(created_at), label
             ORDER BY label ASC`,
            [storeId]
        );

        // Monthly (last 12 months)
        const { rows: monthly } = await db.execute(
            `SELECT TO_CHAR(created_at, 'Mon YYYY') as label, SUM(total_amount) as value 
             FROM orders 
             WHERE store_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '11 months'
             GROUP BY label
             ORDER BY label ASC`,
            [storeId]
        );

        // Annual (last 5 years)
        const { rows: annual } = await db.execute(
            `SELECT TO_CHAR(created_at, 'YYYY') as label, SUM(total_amount) as value 
             FROM orders 
             WHERE store_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '4 years'
             GROUP BY label
             ORDER BY label ASC`,
            [storeId]
        );

        res.json({ daily, monthly, annual });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching income stats' });
    }
};

exports.toggleStoreStatus = async (req, res) => {
    const storeId = req.params.id;
    try {
        // Check ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0 && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await db.execute('UPDATE stores SET is_open = NOT is_open WHERE id = $1', [storeId]);
        res.json({ message: 'Store status toggled' });
    } catch (err) {
        res.status(500).json({ message: 'Error toggling store status' });
    }
};
