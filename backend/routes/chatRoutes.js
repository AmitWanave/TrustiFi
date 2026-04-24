const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getInbox,
  getUnreadCount,
  deleteMessage,
  clearConversation,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/', protect, getInbox);
router.get('/unread/count', protect, getUnreadCount);
router.delete('/conversation/:userId', protect, clearConversation);
router.get('/:userId', protect, getConversation);
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
