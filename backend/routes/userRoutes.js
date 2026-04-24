const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  changePassword,
  getSavedListings,
  toggleSaveListing,
  getAllUsers,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, adminOnly, getAllUsers);
router.get('/saved', protect, getSavedListings);
router.post('/saved/:listingId', protect, toggleSaveListing);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/:id', getUserProfile);

module.exports = router;
