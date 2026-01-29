const express = require('express');
const router = express.Router();
const { addReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('image'), addReview);
router.get('/:storeId', getReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
