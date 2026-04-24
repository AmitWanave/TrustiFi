const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const InspectionReport = require('../models/InspectionReport');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// @desc    Get admin analytics / dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBuyers,
    totalSellers,
    totalInspectors,
    totalListings,
    activeListings,
    pendingListings,
    totalOrders,
    completedOrders,
    disputedOrders,
    pendingInspections,
    totalRevenue,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'buyer' }),
    User.countDocuments({ role: 'seller' }),
    User.countDocuments({ role: 'inspector' }),
    Listing.countDocuments(),
    Listing.countDocuments({ status: 'active' }),
    Listing.countDocuments({ status: 'pending_approval' }),
    Order.countDocuments(),
    Order.countDocuments({ status: 'completed' }),
    Order.countDocuments({ status: 'disputed' }),
    InspectionReport.countDocuments({ status: 'pending' }),
    Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount.final' } } },
    ]),
  ]);

  // New users this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

  // Recent orders for activity feed
  const recentOrders = await Order.find()
    .populate('buyer', 'name')
    .populate('listing', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    stats: {
      users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers, inspectors: totalInspectors, newThisMonth: newUsersThisMonth },
      listings: { total: totalListings, active: activeListings, pending: pendingListings },
      orders: { total: totalOrders, completed: completedOrders, disputed: disputedOrders },
      inspections: { pending: pendingInspections },
      revenue: (totalRevenue && totalRevenue.length > 0) ? totalRevenue[0].total : 0,
    },
    recentOrders,
  });
});

// @desc    Get all users with management options
// @route   GET /api/admin/users
// @access  Private (admin)
const manageUsers = asyncHandler(async (req, res) => {
  const { role, search, banned, page = 1, limit = 20 } = req.query;
  const query = {};

  if (role) query.role = role;
  if (banned === 'true') query.isBanned = true;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.json({ success: true, total, pages: Math.ceil(total / limit), users });
});

// @desc    Update user role or ban status
// @route   PATCH /api/admin/users/:id
// @access  Private (admin)
const updateUser = asyncHandler(async (req, res) => {
  const { role, isBanned, isVerified } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Cannot modify another admin');
  }

  if (role) user.role = role;
  if (typeof isBanned === 'boolean') user.isBanned = isBanned;
  if (typeof isVerified === 'boolean') user.isVerified = isVerified;

  await user.save({ validateBeforeSave: false });

  if (isBanned) {
    await Notification.create({
      recipient: user._id,
      type: 'admin_action',
      title: 'Account Suspended',
      message: 'Your account has been suspended. Please contact support for more details.',
    });
  }

  res.json({ success: true, message: 'User updated', user });
});

// @desc    Approve or reject a listing
// @route   PATCH /api/admin/listings/:id
// @access  Private (admin)
const moderateListing = asyncHandler(async (req, res) => {
  const { action, note, verifiedByTrustifi } = req.body;
  const listing = await Listing.findById(req.params.id).populate('seller', '_id name');

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (action === 'approve') {
    listing.status = 'active';
    listing.isAdminApproved = true;
    listing.adminNote = note;

    // Handle Verified by TrustiFi
    const isTrustVerified = verifiedByTrustifi === 'true' || verifiedByTrustifi === true;
    listing.verifiedByTrustifi = isTrustVerified;

    // Handle uploaded verification report
    if (req.file) {
      listing.verificationReport = `/uploads/reports/${req.file.filename}`;
    }
  } else if (action === 'reject') {
    listing.status = 'rejected';
    listing.isAdminApproved = false;
    listing.adminNote = note;
  } else {
    res.status(400);
    throw new Error('Invalid action. Use approve or reject.');
  }

  await listing.save();

  // Mark admin notifications related to this listing as read (clears the bell badge)
  await Notification.updateMany(
    { relatedId: listing._id, relatedModel: 'Listing', isRead: false },
    { isRead: true, readAt: new Date() }
  );

  await Notification.create({
    recipient: listing.seller._id,
    type: action === 'approve' ? 'listing_approved' : 'listing_rejected',
    title: action === 'approve' ? '✅ Listing Approved!' : '❌ Listing Rejected',
    message:
      action === 'approve'
        ? `Your listing "${listing.title}" is now live!${listing.verifiedByTrustifi ? ' 🛡️ It has been Verified by TrustiFi.' : ''}`
        : `Your listing "${listing.title}" was rejected. Reason: ${note || 'Not specified'}`,
    link: `/seller/listings`,
    relatedId: listing._id,
    relatedModel: 'Listing',
  });

  res.json({ success: true, message: `Listing ${action}d`, listing });
});

// @desc    Get all pending listings for moderation
// @route   GET /api/admin/listings/pending
// @access  Private (admin)
const getPendingListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ status: 'pending_approval' })
    .populate('seller', 'name email isVerified')
    .sort({ createdAt: 1 });

  res.json({ success: true, count: listings.length, listings });
});

// @desc    Resolve a dispute
// @route   PATCH /api/admin/orders/:id/resolve-dispute
// @access  Private (admin)
const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution, newStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.dispute.resolution = resolution;
  order.dispute.resolvedAt = new Date();
  order.status = newStatus || 'completed';
  order.timeline.push({ status: 'dispute_resolved', note: resolution, updatedBy: req.user._id });
  await order.save();

  // Notify both parties
  for (const uid of [order.buyer, order.seller]) {
    await Notification.create({
      recipient: uid,
      type: 'dispute_resolved',
      title: 'Dispute Resolved',
      message: `The dispute on your order has been resolved: ${resolution}`,
      link: `/orders/${order._id}`,
      relatedId: order._id,
      relatedModel: 'Order',
    });
  }

  res.json({ success: true, message: 'Dispute resolved', order });
});

// @desc    Create an inspector user (admin only)
// @route   POST /api/admin/inspectors
// @access  Private (admin)
const createInspector = asyncHandler(async (req, res) => {
  const { name, email, password, certifications, specialization } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const inspector = await User.create({
    name,
    email,
    password,
    role: 'inspector',
    isVerified: true,
    inspectorDetails: { certifications, specialization },
  });

  res.status(201).json({ success: true, message: 'Inspector created', inspector });
});

module.exports = {
  getStats,
  manageUsers,
  updateUser,
  moderateListing,
  getPendingListings,
  resolveDispute,
  createInspector,
};
