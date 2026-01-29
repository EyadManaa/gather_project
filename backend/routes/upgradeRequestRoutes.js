const express = require('express');
const router = express.Router();
const upgradeRequestController = require('../controllers/upgradeRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Store Owner routes
router.post('/', protect, authorize('admin', 'super_admin'), upgradeRequestController.createRequest);
router.get('/store/:storeId', protect, authorize('admin', 'super_admin'), upgradeRequestController.getStoreRequests);

// Super Admin routes
router.get('/', protect, authorize('super_admin'), upgradeRequestController.getAllRequests);
router.patch('/:id/status', protect, authorize('super_admin'), upgradeRequestController.updateRequestStatus);

module.exports = router;
