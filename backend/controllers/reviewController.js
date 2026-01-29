const db = require('../config/db');
const { uploadToSupabase } = require('../utils/supabaseStorage');

exports.addReview = async (req, res) => {
    const { storeId, rating, comment } = req.body;
    try {
        const image_url = req.file ? await uploadToSupabase(req.file, 'reviews') : null;
        await db.execute(
            'INSERT INTO reviews (user_id, store_id, rating, comment, image_url) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, storeId, rating, comment, image_url]
        );
        res.status(201).json({ message: 'Review added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding review' });
    }
};

exports.getReviews = async (req, res) => {
    const storeId = req.params.storeId;
    try {
        const { rows: reviews } = await db.execute(
            `SELECT r.*, u.username 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.store_id = $1`,
            [storeId]
        );
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};

exports.deleteReview = async (req, res) => {
    const reviewId = req.params.id;
    try {
        // Find review and its store owner
        const { rows: reviews } = await db.execute(
            `SELECT r.*, s.owner_id as store_owner_id 
             FROM reviews r 
             JOIN stores s ON r.store_id = s.id 
             WHERE r.id = $1`,
            [reviewId]
        );

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const review = reviews[0];

        // Authorization:
        // 1. User is the author
        // 2. User is the store owner
        // 3. User is super_admin
        const isAuthor = review.user_id === req.user.id;
        const isStoreOwner = review.store_owner_id === req.user.id;
        const isSuperAdmin = req.user.role === 'super_admin';

        if (!isAuthor && !isStoreOwner && !isSuperAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await db.execute('DELETE FROM reviews WHERE id = $1', [reviewId]);
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting review' });
    }
};
