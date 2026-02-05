const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:storeId', sectionController.getSections);
router.post('/:storeId', protect, sectionController.addSection);
router.put('/:sectionId', protect, sectionController.updateSection);
router.delete('/:sectionId', protect, sectionController.deleteSection);

module.exports = router;
