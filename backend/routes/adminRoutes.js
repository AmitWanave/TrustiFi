const express = require('express');
const router = express.Router();
const {
  getStats,
  manageUsers,
  updateUser,
  moderateListing,
  getPendingListings,
  resolveDispute,
  createInspector,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All admin routes require admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', manageUsers);
router.patch('/users/:id', updateUser);
router.post('/inspectors', createInspector);
router.get('/listings/pending', getPendingListings);
// Accept optional report file upload with moderation action
router.patch('/listings/:id', upload.single('verificationReport'), moderateListing);
router.patch('/orders/:id/resolve-dispute', resolveDispute);

module.exports = router;
