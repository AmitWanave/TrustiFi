const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already registered. Please login instead.');
  }

  // Only allow registering as buyer or seller (not admin/inspector via public API)
  const allowedRoles = ['buyer', 'seller'];
  const userRole = allowedRoles.includes(role) ? role : 'buyer';

  let avatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random';
  if (req.file && req.file.location) {
    avatar = req.file.location;
  }

  const user = await User.create({ name, email, password, role: userRole, avatar });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error('Your account has been banned. Please contact support.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      phone: user.phone,
      location: user.location,
    },
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Logout (client-side only; invalidate on frontend)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Google login (Basic/Modular)
// @route   POST /api/auth/google-basic
// @access  Public
const googleLoginBasic = asyncHandler(async (req, res) => {
  const { email, name, avatar } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  if (user) {
    if (user.isBanned) {
      res.status(403);
      throw new Error('Your account has been banned. Please contact support.');
    }
    // Update existing user with Google info if needed
    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
  } else {
    // Create new buyer user
    user = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random`,
      role: 'buyer', // Hardcoded as per user request
      isVerified: true, // Trusted from Google
      password: Math.random().toString(36).slice(-12), // Dummy password for schema requirement
    });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful via Google',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
  });
});

module.exports = { register, login, getMe, logout, googleLoginBasic };
