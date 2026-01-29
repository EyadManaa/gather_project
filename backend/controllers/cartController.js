const db = require('../config/db');

exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        await db.execute(
            'INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3)',
            [req.user.id, productId, quantity || 1]
        );
        res.status(201).json({ message: 'Added to cart' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding to cart' });
    }
};

exports.getCart = async (req, res) => {
    try {
        const { rows: cartItems } = await db.execute(
            `SELECT c.id, c.quantity, p.name, p.price, p.image 
             FROM carts c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = $1`,
            [req.user.id]
        );
        res.json(cartItems);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching cart' });
    }
};

exports.updateCartItem = async (req, res) => {
    const { quantity } = req.body;
    const cartItemId = req.params.id;

    try {
        await db.execute('UPDATE carts SET quantity = $1 WHERE id = $2 AND user_id = $3', [quantity, cartItemId, req.user.id]);
        res.json({ message: 'Cart updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating cart' });
    }
};

exports.removeCartItem = async (req, res) => {
    const cartItemId = req.params.id;

    try {
        await db.execute('DELETE FROM carts WHERE id = $1 AND user_id = $2', [cartItemId, req.user.id]);
        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ message: 'Error removing item' });
    }
};
