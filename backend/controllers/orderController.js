const db = require('../config/db');

exports.checkout = async (req, res) => {
    const { deliveryOption, phoneNumber, orderNotes, location } = req.body;

    try {
        // Get cart items
        const { rows: cartItems } = await db.execute(
            `SELECT c.*, p.price, p.store_id 
             FROM carts c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = $1`,
            [req.user.id]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total
        const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
        const deliveryFee = deliveryOption === 'delivery' ? 5 : 0;
        const total = subtotal + deliveryFee;

        // Group by store
        const storeOrders = {};
        cartItems.forEach(item => {
            if (!storeOrders[item.store_id]) {
                storeOrders[item.store_id] = [];
            }
            storeOrders[item.store_id].push(item);
        });

        // Create orders for each store
        for (const storeId in storeOrders) {
            const storeItems = storeOrders[storeId];
            const storeTotal = storeItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

            // Increment store order count
            await db.execute('UPDATE stores SET order_count = order_count + 1 WHERE id = $1', [storeId]);

            const { rows: newOrders } = await db.execute(
                'INSERT INTO orders (user_id, store_id, total_amount, delivery_option, phone_number, order_notes, location, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
                [req.user.id, storeId, storeTotal + (deliveryOption === 'delivery' ? 5 : 0), deliveryOption, phoneNumber, orderNotes, location, 'pending']
            );

            const orderId = newOrders[0].id;

            // Increment product sales counts and save order items
            for (const item of storeItems) {
                await db.execute('UPDATE products SET sales_count = sales_count + $1 WHERE id = $2', [item.quantity, item.product_id]);

                await db.execute(
                    'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                    [orderId, item.product_id, item.quantity, item.price]
                );
            }
        }


        // Clear cart
        await db.execute('DELETE FROM carts WHERE user_id = $1', [req.user.id]);

        res.json({ message: 'Order placed successfully', total: total.toFixed(2) });
    } catch (err) {
        console.error('Checkout Error:', err.message);
        console.error('Full Error:', err);
        res.status(500).json({ message: 'Error processing checkout', error: err.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const { rows: orders } = await db.execute(
            `SELECT o.*, s.name as store_name 
             FROM orders o 
             JOIN stores s ON o.store_id = s.id 
             WHERE o.user_id = $1 
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

exports.getStoreOrders = async (req, res) => {
    const storeId = req.params.storeId;
    try {
        // Verify ownership
        const { rows: stores } = await db.execute('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0 && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { rows: orders } = await db.execute(
            `SELECT o.*, u.username, u.email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.store_id = $1 
             ORDER BY o.created_at DESC`,
            [storeId]
        );
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching store orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        // Verify store ownership through join
        const { rows: orders } = await db.execute(
            `SELECT o.* FROM orders o 
             JOIN stores s ON o.store_id = s.id 
             WHERE o.id = $1 AND (s.owner_id = $2 OR $3 = 'super_admin')`,
            [orderId, req.user.id, req.user.role]
        );

        if (orders.length === 0) {
            return res.status(403).json({ message: 'Not authorized or order not found' });
        }

        await db.execute('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
        res.json({ message: 'Order status updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating order status' });
    }
};

exports.deleteOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        // Verify store ownership through join
        const { rows: orders } = await db.execute(
            `SELECT o.* FROM orders o 
             JOIN stores s ON o.store_id = s.id 
             WHERE o.id = $1 AND (s.owner_id = $2 OR $3 = 'super_admin')`,
            [orderId, req.user.id, req.user.role]
        );

        if (orders.length === 0) {
            return res.status(403).json({ message: 'Not authorized or order not found' });
        }

        await db.execute('DELETE FROM orders WHERE id = $1', [orderId]);
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting order' });
    }
};

exports.getPurchasedProducts = async (req, res) => {
    try {
        const { rows: products } = await db.execute(
            `SELECT DISTINCT p.*, s.name as store_name 
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             JOIN products p ON oi.product_id = p.id
             JOIN stores s ON p.store_id = s.id
             WHERE o.user_id = $1
             ORDER BY p.name ASC`,
            [req.user.id]
        );
        res.json(products);
    } catch (err) {
        console.error('Get Purchased Products Error:', err);
        res.status(500).json({ message: 'Error fetching purchased products' });
    }
};

