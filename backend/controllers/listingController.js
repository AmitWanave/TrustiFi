const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const User = require('../models/User'); 
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const imeiService = require('../utils/imeiService');

// @desc    Get all active listings with filters & pagination
// @route   GET /api/listings
// @access  Public
const getListings = asyncHandler(async (req, res) => {
  const {
    brand,
    condition,
    minPrice,
    maxPrice,
    city,
    search,
    sort = '-createdAt',
    page = 1,
    limit = 12,
    inspected,
    lat,
    lng,
    radius = 50000, 
  } = req.query;
  
  const hasLocation = (lat !== undefined && lat !== null && lat !== '') && 
                      (lng !== undefined && lng !== null && lng !== '');

  let query = { status: 'active', isAdminApproved: true };

  // Geospatial query
  if (hasLocation) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseInt(radius) || 50000;

    if (search) {
      // If search is present, use $geoWithin to avoid conflict with $text
      const radiusInRadians = radiusNum / 6378137;
      query.geo = {
        $geoWithin: {
          $centerSphere: [[lngNum, latNum], radiusInRadians]
        }
      };
    } else {
      // If no search, use $near for automatic distance sorting
      query.geo = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lngNum, latNum],
          },
          $maxDistance: radiusNum,
        },
      };
    }
  }

  if (brand) query.brand = brand;
  if (condition) query.condition = condition;
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (inspected === 'true') query.inspectionStatus = 'completed';

  if (minPrice || maxPrice) {
    query['price.asking'] = {};
    if (minPrice) query['price.asking'].$gte = Number(minPrice);
    if (maxPrice) query['price.asking'].$lte = Number(maxPrice);
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Define a separate query for counting to avoid $near error in countDocuments
  let countQuery = { ...query };
  if (countQuery.geo && countQuery.geo.$near) {
    const { $geometry, $maxDistance } = countQuery.geo.$near;
    const radiusInRadians = $maxDistance / 6378137;
    countQuery.geo = {
      $geoWithin: {
        $centerSphere: [$geometry.coordinates, radiusInRadians]
      }
    };
  }

  const total = await Listing.countDocuments(countQuery);
  
  let listings;
  if (query.geo && query.geo.$near) {
    // If $near is present, we use aggregation to avoid "context" errors and ensure distance sorting
    const { $geometry, $maxDistance } = query.geo.$near;
    
    const aggregationQuery = { ...query };
    delete aggregationQuery.geo;

    const pipeline = [
      {
        $geoNear: {
          near: $geometry,
          distanceField: "distance",
          maxDistance: $maxDistance,
          query: aggregationQuery, 
          spherical: true
        }
      },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ];

    listings = await Listing.aggregate(pipeline);
    
    listings = await Listing.populate(listings, [
      { path: 'seller', select: 'name avatar sellerRating location' },
      { path: 'inspection', select: 'trustScore.overall trustScore.grade' }
    ]);
  } else {
    // Standard find for other cases
    listings = await Listing.find(query)
      .populate('seller', 'name avatar sellerRating location')
      .populate('inspection', 'trustScore.overall trustScore.grade')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();
  }

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    listings,
  });
});

// @desc    Get single listing details
// @route   GET /api/listings/:id
// @access  Public
const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('seller', 'name avatar sellerRating location phone bio createdAt')
    .populate({
      path: 'inspection',
      populate: { path: 'inspector', select: 'name avatar inspectorDetails' },
    });

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Increment view count
  await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.json({ success: true, listing });
});

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (seller)
const createListing = asyncHandler(async (req, res) => {
  const {
    title, brand, model, condition, description,
    price, specs, location, lat, lng
  } = req.body;

  const images = req.files
    ? req.files.map((file, index) => ({
        url: file.location || `/uploads/listings/${file.filename}`, // fallback for old configs
        isPrimary: index === 0,
      }))
    : [];

  const listing = await Listing.create({
    seller: req.user._id,
    title,
    brand,
    model,
    condition,
    description,
    price: typeof price === 'string' ? JSON.parse(price) : price,
    specs: typeof specs === 'string' ? JSON.parse(specs) : specs,
    location: typeof location === 'string' ? JSON.parse(location) : location,
    geo: (lat && lng) ? { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] } : undefined,
    images,
    status: 'pending_approval',
  });

  // Notify all admins about the new listing submission
  const admins = await User.find({ role: 'admin' }).select('_id');
  if (admins.length > 0) {
    const adminNotifications = admins.map((admin) => ({
      recipient: admin._id,
      sender: req.user._id,
      type: 'admin_action',
      title: '🆕 New Listing Submitted',
      message: `"${listing.title}" (${listing.brand} ${listing.model}) has been submitted by ${req.user.name} and is awaiting your approval.`,
      link: `/admin/listings`,
      relatedId: listing._id,
      relatedModel: 'Listing',
    }));
    await Notification.insertMany(adminNotifications);
  }

  res.status(201).json({
    success: true,
    message: 'Listing submitted for approval',
    listing,
  });
});

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private (seller/admin)
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Only seller or admin can update
  if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this listing');
  }

  const allowedUpdates = ['title', 'description', 'price', 'specs', 'condition', 'location', 'status'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      listing[field] = typeof req.body[field] === 'string' && field !== 'title' && field !== 'description' && field !== 'condition'
        ? JSON.parse(req.body[field])
        : req.body[field];
    }
  });

  // Append new images if uploaded
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.location || `/uploads/listings/${file.filename}`,
      isPrimary: false,
    }));
    listing.images.push(...newImages);
  }

  await listing.save();
  res.json({ success: true, message: 'Listing updated', listing });
});

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (seller/admin)
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this listing');
  }

  const { deleteFileFromS3 } = require('../utils/s3Utils');

  // Delete images from S3
  if (listing.images && listing.images.length > 0) {
    await Promise.all(
      listing.images.map(image => deleteFileFromS3(image.url))
    );
  }

  await listing.deleteOne();
  res.json({ success: true, message: 'Listing deleted successfully' });
});

// @desc    Get listings by logged-in seller
// @route   GET /api/listings/my
// @access  Private (seller)
const getMyListings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { seller: req.user._id };
  if (status) query.status = status;

  const total = await Listing.countDocuments(query);
  const listings = await Listing.find(query)
    .populate('inspection', 'trustScore status')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.json({ success: true, total, listings });
});

// @desc    Make or update an offer on a listing
// @route   POST /api/listings/:id/offers
// @access  Private (buyer)
const makeOffer = asyncHandler(async (req, res) => {
  const { amount, message } = req.body;
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.status !== 'active') {
    res.status(400);
    throw new Error('This listing is not available for offers');
  }

  // Reject if already has a pending offer from this buyer
  const existingOffer = listing.offers.find(
    (o) => o.buyer.toString() === req.user._id.toString() && o.status === 'pending'
  );

  if (existingOffer) {
    existingOffer.amount = amount;
    existingOffer.message = message;
    existingOffer.createdAt = new Date();
  } else {
    listing.offers.push({
      buyer: req.user._id,
      amount,
      message,
      status: 'pending',
    });
  }

  await listing.save();

  // Notify seller
  await Notification.create({
    recipient: listing.seller,
    sender: req.user._id,
    type: 'new_offer',
    title: 'New Offer Received',
    message: `You received an offer of ₹${amount.toLocaleString()} on your listing "${listing.title}"`,
    link: `/seller/listings/${listing._id}`,
    relatedId: listing._id,
    relatedModel: 'Listing',
  });

  res.json({ success: true, message: 'Offer submitted successfully' });
});

// @desc    Respond to an offer (accept/reject)
// @route   PATCH /api/listings/:id/offers/:offerId
// @access  Private (seller)
const respondToOffer = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const offer = listing.offers.id(req.params.offerId);
  if (!offer) {
    res.status(404);
    throw new Error('Offer not found');
  }

  offer.status = status;
  await listing.save();

  // Notify buyer
  await Notification.create({
    recipient: offer.buyer,
    sender: req.user._id,
    type: status === 'accepted' ? 'offer_accepted' : 'offer_rejected',
    title: status === 'accepted' ? 'Offer Accepted! 🎉' : 'Offer Rejected',
    message: `Your offer of ₹${offer.amount.toLocaleString()} on "${listing.title}" has been ${status}`,
    link: `/listings/${listing._id}`,
    relatedId: listing._id,
    relatedModel: 'Listing',
  });

  res.json({ success: true, message: `Offer ${status}`, offer });
});

// @desc    Check IMEI/Device details
// @route   POST /api/listings/check-imei
// @access  Private (seller)
const checkImei = asyncHandler(async (req, res) => {
  const { deviceId, brand } = req.body;

  if (!deviceId) {
    res.status(400);
    throw new Error('Device ID (IMEI/SN) is required');
  }

  try {
    // 1. Get best service ID if not provided
    const serviceId = await imeiService.getBestServiceId(brand || 'Apple'); // Default to Apple for demo if no brand

    // 2. Call IMEIcheck API
    const result = await imeiService.checkImei(deviceId, serviceId);

    console.log('IMEI Check API Response:', JSON.stringify(result, null, 2));

    // 3. Return mapped result
    // The response schema from imeiService.checkImei depends on the API
    // Usually it has a 'status' and 'properties' or similar
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(error.status || 500);
    throw new Error(error.message || 'IMEI check failed');
  }
});

// @desc    Get seller stats
// @route   GET /api/listings/seller-stats
// @access  Private (seller)
const getSellerStats = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const mongoose = require('mongoose');

  const [
    totalListings,
    activeListings,
    soldListings,
    pendingApproval,
    viewsResult,
    orders,
  ] = await Promise.all([
    Listing.countDocuments({ seller: sellerId }),
    Listing.countDocuments({ seller: sellerId, status: 'active' }),
    Listing.countDocuments({ seller: sellerId, status: 'sold' }),
    Listing.countDocuments({ seller: sellerId, status: 'pending_approval' }),
    Listing.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]),
    Order.find({ seller: sellerId }).select('amount status'),
  ]);

  const totalRevenue = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + (order.amount.final || order.amount.asking), 0);

  const pendingOrdersCount = orders.filter(order => order.status === 'pending' || order.status === 'confirmed').length;

  res.json({
    success: true,
    stats: {
      totalListings,
      activeListings,
      soldListings,
      pendingApproval,
      totalViews: viewsResult.length > 0 ? viewsResult[0].totalViews : 0,
      totalRevenue,
      pendingOrders: pendingOrdersCount,
    },
  });
});

module.exports = {
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
};
