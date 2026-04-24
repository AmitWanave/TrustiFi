const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      asking: { type: Number, required: true },
      final: { type: Number },
      platformFee: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled', 'disputed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'bank_transfer', 'upi', 'other'],
      default: 'cash_on_delivery',
    },
    deliveryAddress: {
      name: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },
    trackingInfo: {
      courier: String,
      trackingNumber: String,
      estimatedDelivery: Date,
    },
    timeline: [
      {
        status: String,
        note: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    dispute: {
      raised: { type: Boolean, default: false },
      raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      resolution: String,
      resolvedAt: Date,
    },
    notes: String,
    completedAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
