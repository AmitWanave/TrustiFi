const express = require('express');
const router = express.Router();
const {
  createReview,
  getUserReviews,
  getMyReviews,
  respondToReview,
  getListingReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/mine', protect, getMyReviews);
router.post('/:id/respond', protect, respondToReview);
router.get('/user/:userId', getUserReviews);
router.get('/listing/:listingId', getListingReviews);

module.exports = router;
