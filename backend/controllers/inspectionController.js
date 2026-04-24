const asyncHandler = require('express-async-handler');
const InspectionReport = require('../models/InspectionReport');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculateTrustScore } = require('../utils/trustScoreCalculator');

// @desc    Request inspection for a listing
// @route   POST /api/inspections/request/:listingId
// @access  Private (seller)
const requestInspection = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.listingId);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to request inspection for this listing');
  }

  if (listing.inspectionStatus !== 'not_requested') {
    res.status(400);
    throw new Error('Inspection already requested for this listing');
  }

  const report = await InspectionReport.create({
    listing: listing._id,
    requestedBy: req.user._id,
    status: 'pending',
    scheduledDate: req.body.scheduledDate,
  });

  listing.inspectionStatus = 'requested';
  listing.inspection = report._id;
  await listing.save();

  // Notify all admins about the inspection request
  const admins = await User.find({ role: 'admin' }).select('_id');
  const adminNotifs = admins.map((admin) => ({
    recipient: admin._id,
    sender: req.user._id,
    type: 'inspection_requested',
    title: '🔍 Inspection Requested',
    message: `"${listing.title}" (${listing.brand} ${listing.model}) — seller ${req.user.name} has requested a TrustiFi inspection.`,
    link: `/admin/inspections`,
    relatedId: report._id,
    relatedModel: 'InspectionReport',
  }));
  if (adminNotifs.length > 0) {
    await Notification.insertMany(adminNotifs);
  }

  res.status(201).json({
    success: true,
    message: 'Inspection requested successfully. An inspector will be assigned shortly.',
    report,
  });
});

// @desc    Get all pending inspections (admin/inspector view)
// @route   GET /api/inspections
// @access  Private (admin/inspector)
const getAllInspections = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (req.user.role === 'inspector') {
    query.$or = [{ inspector: req.user._id }, { status: 'pending' }];
  }
  if (status) query.status = status;

  const total = await InspectionReport.countDocuments(query);
  const reports = await InspectionReport.find(query)
    .populate('listing', 'title brand model images')
    .populate('requestedBy', 'name email')
    .populate('inspector', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.json({ success: true, total, reports });
});

// @desc    Get single inspection report
// @route   GET /api/inspections/:id
// @access  Private
const getInspectionById = asyncHandler(async (req, res) => {
  const report = await InspectionReport.findById(req.params.id)
    .populate('listing', 'title brand model images seller')
    .populate('requestedBy', 'name email')
    .populate('inspector', 'name avatar inspectorDetails');

  if (!report) {
    res.status(404);
    throw new Error('Inspection report not found');
  }

  res.json({ success: true, report });
});

// @desc    Assign inspector to an inspection
// @route   PATCH /api/inspections/:id/assign
// @access  Private (admin)
const assignInspector = asyncHandler(async (req, res) => {
  const { inspectorId, scheduledDate } = req.body;

  const inspector = await User.findById(inspectorId);
  if (!inspector || inspector.role !== 'inspector') {
    res.status(400);
    throw new Error('Invalid inspector ID');
  }

  const report = await InspectionReport.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Inspection report not found');
  }

  report.inspector = inspectorId;
  report.status = 'assigned';
  if (scheduledDate) report.scheduledDate = scheduledDate;
  await report.save();

  // Update listing
  await Listing.findByIdAndUpdate(report.listing, { inspectionStatus: 'assigned' });

  // Notify inspector
  await Notification.create({
    recipient: inspectorId,
    type: 'inspection_assigned',
    title: 'New Inspection Assigned',
    message: 'You have been assigned a new phone inspection. Please check your dashboard.',
    link: `/inspector/inspections/${report._id}`,
    relatedId: report._id,
    relatedModel: 'InspectionReport',
  });

  // Notify seller
  await Notification.create({
    recipient: report.requestedBy,
    type: 'inspection_assigned',
    title: 'Inspector Assigned',
    message: 'An inspector has been assigned to your listing. Inspection will be conducted soon.',
    link: `/seller/inspections`,
    relatedId: report._id,
    relatedModel: 'InspectionReport',
  });

  res.json({ success: true, message: 'Inspector assigned', report });
});

// @desc    Submit inspection report (by inspector)
// @route   POST /api/inspections/:id/submit
// @access  Private (inspector)
const submitReport = asyncHandler(async (req, res) => {
  const report = await InspectionReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Inspection report not found');
  }

  if (report.inspector?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to submit this inspection');
  }

  if (report.status === 'completed') {
    res.status(400);
    throw new Error('Report already submitted');
  }

  const { imei, hardware, battery, parts, performance, summary, recommendations, redFlags } = req.body;

  // Apply data
  report.imei = { ...report.imei, ...imei };
  report.hardware = hardware;
  report.battery = battery;
  report.parts = parts;
  report.performance = performance;
  report.summary = summary;
  report.recommendations = recommendations;
  report.redFlags = redFlags;
  report.status = 'completed';
  report.completedDate = new Date();

  // Handle inspection photos
  if (req.files && req.files.length > 0) {
    report.photos = req.files.map((f) => f.location || `/uploads/inspections/${f.filename}`);
  }

  // Calculate trust score
  const trustScore = calculateTrustScore({ imei, hardware, battery, parts, performance });
  report.trustScore = trustScore;

  await report.save();

  // Update listing
  await Listing.findByIdAndUpdate(report.listing, {
    inspectionStatus: 'completed',
    status: 'active',
    isAdminApproved: true,
  });

  // Update inspector stats
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { 'inspectorDetails.totalInspections': 1 },
  });

  // Notify seller
  await Notification.create({
    recipient: report.requestedBy,
    type: 'inspection_completed',
    title: '✅ Inspection Complete!',
    message: `Your listing received a Trust Score of ${trustScore.overall}/100 (Grade: ${trustScore.grade}). It is now live!`,
    link: `/seller/inspections`,
    relatedId: report._id,
    relatedModel: 'InspectionReport',
  });

  res.json({ success: true, message: 'Inspection submitted successfully', report });
});

// @desc    Get inspections assigned to logged-in inspector
// @route   GET /api/inspections/assigned
// @access  Private (inspector)
const getMyInspections = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { inspector: req.user._id };
  if (status) query.status = status;

  const reports = await InspectionReport.find(query)
    .populate('listing', 'title brand model images condition')
    .populate('requestedBy', 'name phone location')
    .sort({ createdAt: -1 });

  res.json({ success: true, reports });
});

module.exports = {
  requestInspection,
  getAllInspections,
  getInspectionById,
  assignInspector,
  submitReport,
  getMyInspections,
};
