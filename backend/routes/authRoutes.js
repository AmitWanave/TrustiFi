const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, googleLoginBasic } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.post('/google-basic', googleLoginBasic);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
