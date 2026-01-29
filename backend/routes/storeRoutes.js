const express = require('express');
const router = express.Router();
const { createStore, getStores, getFeaturedStores, getMyStore, updateStore, deleteStore, getStoreStats, incrementVisitors, getIncomeStats } = require('../controllers/storeController');
const { getStoreUsers, banUserFromStore, unbanUserFromStore, checkBanStatus } = require('../controllers/storeUserController');
const { protect, authorize, protectOptional } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getStores);
router.get('/featured', getFeaturedStores);
router.post('/', protect, authorize('admin', 'super_admin'), upload.fields([{ name: 'profile_pic' }, { name: 'banner' }]), createStore);
router.get('/my-store', protect, authorize('admin', 'super_admin'), getMyStore);
router.put('/:id', protect, authorize('admin', 'super_admin'), upload.fields([{ name: 'profile_pic' }, { name: 'banner' }]), updateStore);
router.patch('/:id/toggle-status', protect, authorize('admin', 'super_admin'), require('../controllers/storeController').toggleStoreStatus);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteStore);
router.get('/:id/stats', protect, authorize('admin', 'super_admin'), getStoreStats);
router.get('/:id/income-stats', protect, authorize('admin', 'super_admin'), getIncomeStats);

router.post('/:id/visitors', protectOptional, incrementVisitors);
router.get('/:storeId/ban-status', protectOptional, checkBanStatus);

// User Management for Store Owners
router.get('/:storeId/users', protect, authorize('admin', 'super_admin'), getStoreUsers);
router.post('/ban', protect, authorize('admin', 'super_admin'), banUserFromStore);
router.post('/unban', protect, authorize('admin', 'super_admin'), unbanUserFromStore);


module.exports = router;

