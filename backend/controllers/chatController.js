const asyncHandler = require('express-async-handler');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Send a message
// @route   POST /api/chats
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, listingId, content, type = 'text' } = req.body;

  if (!receiverId || !content) {
    res.status(400);
    throw new Error('Receiver and message content are required');
  }

  if (receiverId === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot message yourself');
  }

  const message = await ChatMessage.create({
    sender: req.user._id,
    receiver: receiverId,
    listing: listingId || null,
    content,
    type,
  });

  await message.populate('sender', 'name avatar');
  await message.populate('receiver', 'name avatar');

  // Notify receiver
  await Notification.create({
    recipient: receiverId,
    sender: req.user._id,
    type: 'new_message',
    title: `New message from ${req.user.name}`,
    message: content.substring(0, 80),
    link: `/chats/${req.user._id}`,
    relatedId: message._id,
    relatedModel: 'ChatMessage',
  });

  res.status(201).json({ success: true, message });
});

// @desc    Get conversation between two users (optionally for a listing)
// @route   GET /api/chats/:userId
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { listingId, page = 1, limit = 50 } = req.query;
  const myId = req.user._id;

  const query = {
    $or: [
      { sender: myId, receiver: userId },
      { sender: userId, receiver: myId },
    ],
    isDeleted: false,
  };

  if (listingId) query.listing = listingId;

  const total = await ChatMessage.countDocuments(query);
  const messages = await ChatMessage.find(query)
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  // Mark messages as read
  await ChatMessage.updateMany(
    { sender: userId, receiver: myId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({ success: true, total, messages });
});

// @desc    Get all conversations (inbox) for logged in user
// @route   GET /api/chats
// @access  Private
const getInbox = asyncHandler(async (req, res) => {
  const myId = req.user._id;

  // Aggregate to find latest message per conversation partner
  const conversations = await ChatMessage.aggregate([
    {
      $match: {
        $or: [{ sender: myId }, { receiver: myId }],
        isDeleted: false,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [{ $lt: ['$sender', '$receiver'] }, { s: '$sender', r: '$receiver' }, { s: '$receiver', r: '$sender' }],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$receiver', myId] }, { $eq: ['$isRead', false] }] }, 1, 0],
          },
        },
      },
    },
    { $replaceRoot: { newRoot: { $mergeObjects: ['$lastMessage', { unreadCount: '$unreadCount' }] } } },
    { $sort: { createdAt: -1 } },
  ]);

  await ChatMessage.populate(conversations, [
    { path: 'sender', select: 'name avatar' },
    { path: 'receiver', select: 'name avatar' },
    { path: 'listing', select: 'title brand images' },
  ]);

  res.json({ success: true, conversations });
});

// @desc    Get unread message count
// @route   GET /api/chats/unread/count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await ChatMessage.countDocuments({
    receiver: req.user._id,
    isRead: false,
    isDeleted: false,
  });
  res.json({ success: true, count });
});

// @desc    Delete a message (soft delete)
// @route   DELETE /api/chats/:messageId
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const msg = await ChatMessage.findById(req.params.messageId);

  if (!msg) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (msg.sender.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this message');
  }

  msg.isDeleted = true;
  await msg.save();

  res.json({ success: true, message: 'Message deleted' });
});

// @desc    Clear entire conversation thread
// @route   DELETE /api/chats/conversation/:userId
// @access  Private
const clearConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { listingId } = req.query;
  const myId = req.user._id;

  const query = {
    $or: [
      { sender: myId, receiver: userId },
      { sender: userId, receiver: myId },
    ],
    isDeleted: false,
  };

  if (listingId) query.listing = listingId;

  const result = await ChatMessage.updateMany(query, { isDeleted: true });

  res.json({
    success: true,
    message: `Conversation cleared. ${result.modifiedCount} messages marked as deleted.`,
  });
});

module.exports = { sendMessage, getConversation, getInbox, getUnreadCount, deleteMessage, clearConversation };
