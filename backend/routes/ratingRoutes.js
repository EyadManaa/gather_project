const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, ratingController.submitRating);
router.get('/:storeId', protect, ratingController.getUserRating);
router.get('/:storeId/stats', ratingController.getRatingStats);

module.exports = router;
