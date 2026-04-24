const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: ['buyer_to_seller', 'seller_to_buyer'],
      required: true,
    },
    categories: {
      communication: { type: Number, min: 1, max: 5 },
      accuracy: { type: Number, min: 1, max: 5 },
      packaging: { type: Number, min: 1, max: 5 },
      speed: { type: Number, min: 1, max: 5 },
    },
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reported: { type: Boolean, default: false },
    reportReason: String,
    response: {
      content: String,
      respondedAt: Date,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per order
reviewSchema.index({ reviewer: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
