const express = require('express');
const router = express.Router();
const { banUser, banStore, getGlobalStats, getStoreOwners, getSubscriptions, updateSubscription, getAllStores, getRevenueChart, impersonateUser, getAllUsers, getUserOrders } = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.put('/ban-user/:id', protect, authorize('super_admin'), banUser);
router.put('/ban-store/:id', protect, authorize('super_admin'), banStore);
router.get('/stats', protect, authorize('super_admin'), getGlobalStats);
router.get('/revenue-chart', protect, authorize('super_admin'), getRevenueChart);
router.get('/owners', protect, authorize('super_admin'), getStoreOwners);
router.post('/impersonate/:id', protect, authorize('super_admin'), impersonateUser);
router.get('/subs', protect, authorize('super_admin'), getSubscriptions);
router.put('/subs/:id', protect, authorize('super_admin'), updateSubscription);
router.get('/all-stores', protect, authorize('super_admin'), getAllStores);
router.get('/users', protect, authorize('super_admin'), getAllUsers);
router.get('/user-orders/:id', protect, authorize('super_admin'), getUserOrders);

module.exports = router;
