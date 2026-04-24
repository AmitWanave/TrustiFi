const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a review (post-purchase)
// @route   POST /api/reviews
// @access  Private (buyer)
const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, title, comment, categories, type } = req.body;

  const order = await Order.findById(orderId)
    .populate('listing', 'title')
    .populate('seller')
    .populate('buyer');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status !== 'completed') {
    res.status(400);
    throw new Error('You can only review after the order is completed');
  }

  // Determine reviewer/reviewee based on type
  const isMyOrder = order.buyer._id.toString() === req.user._id.toString();
  if (!isMyOrder) {
    res.status(403);
    throw new Error('Not authorized to review this order');
  }

  const reviewee = order.seller._id;

  // Check duplicate
  const exists = await Review.findOne({ reviewer: req.user._id, order: orderId });
  if (exists) {
    res.status(400);
    throw new Error('You have already reviewed this order');
  }

  const review = await Review.create({
    reviewer: req.user._id,
    reviewee,
    listing: order.listing._id,
    order: orderId,
    rating,
    title,
    comment,
    categories,
    type: 'buyer_to_seller',
  });

  // Update seller's average rating
  const allReviews = await Review.find({ reviewee, type: 'buyer_to_seller' });
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await User.findByIdAndUpdate(reviewee, {
    'sellerRating.average': Math.round(avg * 10) / 10,
    'sellerRating.count': allReviews.length,
  });

  // Notify seller
  await Notification.create({
    recipient: reviewee,
    sender: req.user._id,
    type: 'new_review',
    title: `New ${rating}⭐ Review!`,
    message: `${req.user.name} left a review for "${order.listing.title}"`,
    link: `/seller/reviews`,
    relatedId: review._id,
    relatedModel: 'Review',
  });

  res.status(201).json({ success: true, message: 'Review submitted', review });
});

// @desc    Get reviews for a user (seller profile page)
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { reviewee: req.params.userId, type: 'buyer_to_seller' };

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('reviewer', 'name avatar')
    .populate('listing', 'title images')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.json({ success: true, total, reviews });
});

// @desc    Get reviews I wrote (my reviews as buyer)
// @route   GET /api/reviews/mine
// @access  Private
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewer: req.user._id })
    .populate('listing', 'title images')
    .populate('reviewee', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

// @desc    Respond to a review (seller)
// @route   POST /api/reviews/:id/respond
// @access  Private (seller)
const respondToReview = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.reviewee.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  review.response = { content, respondedAt: new Date() };
  await review.save();

  res.json({ success: true, message: 'Response added', review });
});

// @desc    Get reviews for a listing (public)
// @route   GET /api/reviews/listing/:listingId
// @access  Public
const getListingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ listing: req.params.listingId })
    .populate('reviewer', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

module.exports = {
  createReview,
  getUserReviews,
  getMyReviews,
  respondToReview,
  getListingReviews,
};
