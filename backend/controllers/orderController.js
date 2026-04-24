const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

// @desc    Place a new order / reserve a phone
// @route   POST /api/orders
// @access  Private (buyer)
const createOrder = asyncHandler(async (req, res) => {
  const { listingId, deliveryAddress, paymentMethod, finalAmount } = req.body;

  const listing = await Listing.findById(listingId).populate('seller');
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.status !== 'active') {
    res.status(400);
    throw new Error('This listing is not available for purchase');
  }

  if (listing.seller._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot purchase your own listing');
  }

  const order = await Order.create({
    listing: listing._id,
    buyer: req.user._id,
    seller: listing.seller._id,
    amount: {
      asking: listing.price.asking,
      final: finalAmount || listing.price.asking,
    },
    deliveryAddress,
    paymentMethod: paymentMethod || 'cash_on_delivery',
    status: 'pending',
    timeline: [{ status: 'pending', note: 'Order placed by buyer' }],
  });

  // listing.status = 'reserved'; // REMOVED: Now handled after seller approval
  // await listing.save();

  // Notify seller
  await Notification.create({
    recipient: listing.seller._id,
    sender: req.user._id,
    type: 'order_placed',
    title: '🛒 New Order Received!',
    message: `Someone placed an order for "${listing.title}". Please confirm.`,
    link: `/seller/orders`,
    relatedId: order._id,
    relatedModel: 'Order',
  });

  const populated = await Order.findById(order._id)
    .populate('listing', 'title images brand model')
    .populate('seller', 'name phone');

  res.status(201).json({ success: true, message: 'Order placed!', order: populated });
});

// @desc    Get buyer's orders
// @route   GET /api/orders/my
// @access  Private (buyer)
const getMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { buyer: req.user._id };
  if (status) query.status = status;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('listing', 'title images brand model price')
    .populate('seller', 'name avatar phone')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.json({ success: true, total, orders });
});

// @desc    Get seller's orders
// @route   GET /api/orders/seller
// @access  Private (seller)
const getSellerOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { seller: req.user._id };
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('listing', 'title images brand model')
    .populate('buyer', 'name avatar phone email')
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('listing')
    .populate('buyer', 'name email phone avatar')
    .populate('seller', 'name email phone avatar');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isParty =
    order.buyer._id.toString() === req.user._id.toString() ||
    order.seller._id.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!isParty) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({ success: true, order });
});

// @desc    Update order status (seller/admin)
// @route   PATCH /api/orders/:id/status
// @access  Private (seller/admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingInfo } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isAuthorized =
    order.seller.toString() === req.user._id.toString() || req.user.role === 'admin';
  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const oldStatus = order.status;
  order.status = status;
  order.timeline.push({ status, note, updatedBy: req.user._id });
  if (trackingInfo) order.trackingInfo = trackingInfo;
  if (status === 'completed') order.completedAt = new Date();
  if (status === 'cancelled') order.cancelledAt = new Date();

  await order.save();

  // Listing status management based on order status
  if (status === 'confirmed') {
    await Listing.findByIdAndUpdate(order.listing, { status: 'reserved' });
    // Cancel other pending orders for this listing to avoid conflicts
    await Order.updateMany(
      { listing: order.listing, _id: { $ne: order._id }, status: 'pending' },
      { 
        status: 'cancelled', 
        $push: { timeline: { status: 'cancelled', note: 'Phone reserved by another buyer', updatedBy: req.user._id } } 
      }
    );
  } else if (status === 'completed') {
    await Listing.findByIdAndUpdate(order.listing, { status: 'sold' });
  } else if (status === 'cancelled' && oldStatus === 'confirmed') {
    // Re-activate listing if the confirmed reservation is cancelled
    await Listing.findByIdAndUpdate(order.listing, { status: 'active' });
  }

  // Notify buyer
  const typeMap = {
    confirmed: 'order_confirmed',
    in_transit: 'order_shipped',
    delivered: 'order_delivered',
    cancelled: 'order_cancelled',
  };

  if (typeMap[status]) {
    await Notification.create({
      recipient: order.buyer,
      type: typeMap[status],
      title: `Order ${status.replace('_', ' ').toUpperCase()}`,
      message: note || `Your order status has been updated to ${status}`,
      link: `/buyer/orders/${order._id}`,
      relatedId: order._id,
      relatedModel: 'Order',
    });
  }

  res.json({ success: true, message: `Order status updated to ${status}`, order });
});

// @desc    Raise a dispute
// @route   POST /api/orders/:id/dispute
// @access  Private (buyer/seller)
const raiseDispute = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.dispute.raised) {
    res.status(400);
    throw new Error('Dispute already raised for this order');
  }

  order.dispute = {
    raised: true,
    raisedBy: req.user._id,
    reason,
  };
  order.status = 'disputed';
  await order.save();

  res.json({ success: true, message: 'Dispute raised. Admin will review.', order });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('listing', 'title brand model')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.json({ success: true, total, orders });
});

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
  raiseDispute,
  getAllOrders,
};
