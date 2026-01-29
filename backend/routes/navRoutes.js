const express = require('express');
const router = express.Router();
const { getStoreNav, addStoreNav, deleteStoreNav, updateStoreNav } = require('../controllers/navController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/:storeId', getStoreNav);
router.post('/:storeId', protect, authorize('admin', 'super_admin'), addStoreNav);
router.put('/:navId', protect, authorize('admin', 'super_admin'), updateStoreNav);
router.delete('/:navId', protect, authorize('admin', 'super_admin'), deleteStoreNav);


module.exports = router;
