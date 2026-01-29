const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, deleteProduct, updateProduct, getTrendingProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getProducts);
router.get('/trending', getTrendingProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('admin', 'super_admin'), upload.single('image'), createProduct);
router.put('/:id', protect, authorize('admin', 'super_admin'), upload.single('image'), updateProduct);
router.patch('/:id/toggle-stock', protect, authorize('admin', 'super_admin'), require('../controllers/productController').toggleStockStatus);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteProduct);


module.exports = router;
