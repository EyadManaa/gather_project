const express = require('express');
const router = express.Router();
const { checkout, getMyOrders, getStoreOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/checkout', protect, checkout);
router.get('/my-orders', protect, getMyOrders);
router.get('/store/:storeId', protect, authorize('admin', 'super_admin'), getStoreOrders);
router.patch('/:orderId/status', protect, authorize('admin', 'super_admin'), updateOrderStatus);
router.delete('/:orderId', protect, authorize('admin', 'super_admin'), deleteOrder);



module.exports = router;
