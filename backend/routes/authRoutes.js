const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, deleteProfilePic } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePic'), updateProfile);
router.delete('/profile/pic', protect, deleteProfilePic);

module.exports = router;
