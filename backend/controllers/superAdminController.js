const db = require('../config/db');

exports.banUser = async (req, res) => {
    try {
        await db.execute('UPDATE users SET is_banned = NOT is_banned WHERE id = $1', [req.params.id]);
        res.json({ message: 'User status updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user status' });
    }
};

exports.banStore = async (req, res) => {
    try {
        await db.execute('UPDATE stores SET is_banned = NOT is_banned WHERE id = $1', [req.params.id]);
        res.json({ message: 'Store status updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating store status' });
    }
};

exports.getGlobalStats = async (req, res) => {
    try {
        const { rows: userCountRows } = await db.execute('SELECT COUNT(*) as usercount FROM users');
        const userCount = userCountRows[0].usercount;
        const { rows: storeCountRows } = await db.execute('SELECT COUNT(*) as storecount FROM stores');
        const storeCount = storeCountRows[0].storecount;

        // 1. Calculate Commissions: 10% of completed order totals
        const { rows: commissionRows } = await db.execute("SELECT SUM(total_amount * 0.1) as totalcommissions FROM orders WHERE status IN ('completed', 'finished')");
        const totalCommissions = commissionRows[0].totalcommissions;

        // 2. Calculate Subscription Revenue: Sum of prices based on each store's tier
        const { rows: subRevenueRows } = await db.execute(`
            SELECT SUM(sub.price) as subrevenue 
            FROM stores s 
            JOIN subscriptions sub ON LOWER(s.subscription_tier::text) = LOWER(sub.name::text)
        `);
        const subRevenue = subRevenueRows[0].subrevenue || 0;

        // Total Profit = Commissions + Subscription Revenue
        const finalProfit = (parseFloat(totalCommissions || 0) + parseFloat(subRevenue || 0)).toFixed(2);

        const { rows: activeSubsRows } = await db.execute("SELECT COUNT(*) as activesubs FROM stores WHERE subscription_tier::text != 'free'");
        const activeSubs = parseInt(activeSubsRows[0].activesubs);

        res.json({
            userCount: parseInt(userCount),
            storeCount: parseInt(storeCount),
            totalProfit: finalProfit,
            activeSubscriptions: activeSubs || 0
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

exports.getRevenueChart = async (req, res) => {
    try {
        // Fetch last 14 days of revenue
        const { rows: data } = await db.execute(`
            SELECT 
                created_at::DATE as date, 
                SUM(total_amount * 0.1) as revenue 
            FROM orders 
            WHERE status IN ('completed', 'finished') 
            AND created_at >= CURRENT_DATE - INTERVAL '14 days'
            GROUP BY created_at::DATE
            ORDER BY date ASC
        `);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching chart data' });
    }
};

exports.getStoreOwners = async (req, res) => {
    try {
        const { rows: owners } = await db.execute(`
            SELECT u.id, u.username, u.email, u.address, s.name as store_name, s.id as store_id 
            FROM users u 
            JOIN stores s ON u.id = s.owner_id 
            WHERE u.role = 'admin'
        `);
        res.json(owners);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching owners' });
    }
};

exports.getSubscriptions = async (req, res) => {
    try {
        const { rows: subs } = await db.execute('SELECT * FROM subscriptions');
        res.json(subs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching subscriptions' });
    }
};

exports.updateSubscription = async (req, res) => {
    const { id } = req.params;
    const { price, features, duration_days } = req.body;
    const featuresArray = Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : []);
    try {
        await db.execute('UPDATE subscriptions SET price = $1, features = $2, duration_days = $3 WHERE id = $4', [price, featuresArray, duration_days, id]);
        res.json({ message: 'Subscription updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating subscription' });
    }
};

const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.impersonateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows: users } = await db.execute('SELECT id, username, email, role FROM users WHERE id = $1', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const targetUser = users[0];
        const token = generateToken(targetUser.id, targetUser.role);

        res.json({
            token,
            user: targetUser
        });
    } catch (err) {
        res.status(500).json({ message: 'Impersonation failed' });
    }
};

exports.getAllStores = async (req, res) => {
    try {
        const { rows: stores } = await db.execute(`
            SELECT s.*, u.username as owner_name 
            FROM stores s 
            JOIN users u ON s.owner_id = u.id
        `);

        // Enrich each store with performance metrics
        const enrichedStores = await Promise.all(stores.map(async (store) => {
            // Get visits: last 30 days vs previous 30 days
            const { rows: currentVisitsRows } = await db.execute(
                "SELECT COUNT(*) as count FROM store_visits WHERE store_id = $1 AND visited_at >= NOW() - INTERVAL '30 days'",
                [store.id]
            );
            const currentVisits = currentVisitsRows[0];

            const { rows: previousVisitsRows } = await db.execute(
                "SELECT COUNT(*) as count FROM store_visits WHERE store_id = $1 AND visited_at >= NOW() - INTERVAL '60 days' AND visited_at < NOW() - INTERVAL '30 days'",
                [store.id]
            );
            const previousVisits = previousVisitsRows[0];

            // Get orders: last 30 days vs previous 30 days
            const { rows: currentOrdersRows } = await db.execute(
                "SELECT COUNT(*) as count FROM orders WHERE store_id = $1 AND created_at >= NOW() - INTERVAL '30 days'",
                [store.id]
            );
            const currentOrders = currentOrdersRows[0];

            const { rows: previousOrdersRows } = await db.execute(
                "SELECT COUNT(*) as count FROM orders WHERE store_id = $1 AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'",
                [store.id]
            );
            const previousOrders = previousOrdersRows[0];

            // Get reviews: last 30 days vs previous 30 days
            const { rows: currentReviewsRows } = await db.execute(
                "SELECT COUNT(*) as count FROM reviews WHERE store_id = $1 AND created_at >= NOW() - INTERVAL '30 days'",
                [store.id]
            );
            const currentReviews = currentReviewsRows[0];

            const { rows: previousReviewsRows } = await db.execute(
                "SELECT COUNT(*) as count FROM reviews WHERE store_id = $1 AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'",
                [store.id]
            );
            const previousReviews = previousReviewsRows[0];

            // Calculate percentage changes
            const calculateGrowth = (current, previous) => {
                const curr = parseInt(current || 0);
                const prev = parseInt(previous || 0);
                if (prev === 0 && curr === 0) return 0;
                if (prev === 0) return 100;
                return Math.round(((curr - prev) / prev) * 100);
            };

            return {
                ...store,
                performance: {
                    visits_growth: calculateGrowth(currentVisits.count, previousVisits.count),
                    orders_growth: calculateGrowth(currentOrders.count, previousOrders.count),
                    reviews_growth: calculateGrowth(currentReviews.count, previousReviews.count),
                    current_visits: parseInt(currentVisits.count),
                    current_orders: parseInt(currentOrders.count),
                    current_reviews: parseInt(currentReviews.count)
                }
            };
        }));

        res.json(enrichedStores);
    } catch (err) {
        console.error('Error fetching stores:', err);
        res.status(500).json({ message: 'Error fetching stores' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { rows: users } = await db.execute(`
            SELECT u.id, u.username, u.email, u.role, u.created_at, u.is_banned,
            (SELECT SUM(total_amount) FROM orders WHERE user_id = u.id AND status IN ('completed', 'finished')) as total_spent
            FROM users u 
            WHERE u.role != 'super_admin' 
            ORDER BY u.created_at DESC
        `);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

exports.getUserOrders = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows: orders } = await db.execute(`
            SELECT o.*, s.name as store_name 
            FROM orders o 
            JOIN stores s ON o.store_id = s.id 
            WHERE o.user_id = $1 
            ORDER BY o.created_at DESC
        `, [id]);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user orders' });
    }
};
