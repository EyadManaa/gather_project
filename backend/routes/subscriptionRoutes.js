const express = require('express');
const router = express.Router();
const { getSubscriptions } = require('../controllers/subscriptionController');

// Public route - no auth required
router.get('/', getSubscriptions);

module.exports = router;
