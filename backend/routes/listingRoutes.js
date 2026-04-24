const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  getSellerStats,
  makeOffer,
  respondToOffer,
  checkImei,
} = require('../controllers/listingController');
const { protect, sellerOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getListings);
router.get('/my', protect, getMyListings);
router.get('/seller-stats', protect, getSellerStats);
router.get('/:id', getListingById);

// Private - seller routes
router.post('/check-imei', protect, checkImei);
router.post('/', protect, sellerOrAdmin, upload.array('images', 8), createListing);
router.put('/:id', protect, upload.array('images', 8), updateListing);
router.delete('/:id', protect, deleteListing);

// Offer routes
router.post('/:id/offers', protect, makeOffer);
router.patch('/:id/offers/:offerId', protect, respondToOffer);

module.exports = router;
