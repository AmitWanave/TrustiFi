const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Listing = require('../models/Listing');

// @desc    Get user public profile
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    '-password -savedListings -resetPasswordToken -resetPasswordExpire'
  );
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, bio, location } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bio) user.bio = bio;
  
  if (location) {
    try {
      // If location is sent as stringified JSON via FormData
      const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      user.location = { ...user.location, ...parsedLocation };
    } catch (e) {
      // Fallback if it's just a simple city string
      user.location = { ...user.location, city: location };
    }
  }

  // Handle avatar upload
  if (req.file) {
    user.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
    },
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

// @desc    Get saved listings for buyer
// @route   GET /api/users/saved
// @access  Private (buyer)
const getSavedListings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedListings',
    match: { status: 'active' },
    populate: { path: 'seller', select: 'name avatar' },
  });

  // Filter out listings that are null (due to match filter or being deleted)
  const filteredListings = user.savedListings.filter((item) => item !== null);

  // Background cleanup: update the database if some listings were removed
  if (filteredListings.length !== user.savedListings.length) {
    console.log(`Cleaning up ${user.savedListings.length - filteredListings.length} closed listings for user ${req.user._id}`);
    user.savedListings = filteredListings.map((listing) => listing._id);
    await user.save({ validateBeforeSave: false });
  }

  res.json({ success: true, savedListings: filteredListings });
});

// @desc    Save or unsave a listing
// @route   POST /api/users/saved/:listingId
// @access  Private (buyer)
const toggleSaveListing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const listingId = req.params.listingId;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  const index = user.savedListings.indexOf(listingId);
  let saved;

  if (index === -1) {
    user.savedListings.push(listingId);
    listing.savedBy.addToSet(req.user._id);
    saved = true;
  } else {
    user.savedListings.splice(index, 1);
    listing.savedBy.pull(req.user._id);
    saved = false;
  }

  await user.save({ validateBeforeSave: false });
  await listing.save({ validateBeforeSave: false });

  res.json({ success: true, saved, message: saved ? 'Listing saved' : 'Listing removed from saved' });
});

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};

  if (role) query.role = role;
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

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    users,
  });
});

module.exports = {
  getUserProfile,
  updateProfile,
  changePassword,
  getSavedListings,
  toggleSaveListing,
  getAllUsers,
};
