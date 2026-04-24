const express = require('express');
const router = express.Router();
const {
  requestInspection,
  getAllInspections,
  getInspectionById,
  assignInspector,
  submitReport,
  getMyInspections,
} = require('../controllers/inspectionController');
const { protect, adminOnly, inspectorOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/request/:listingId', protect, requestInspection);
router.get('/', protect, inspectorOrAdmin, getAllInspections);
router.get('/assigned', protect, getMyInspections);
router.get('/:id', protect, getInspectionById);
router.patch('/:id/assign', protect, adminOnly, assignInspector);
router.post('/:id/submit', protect, upload.array('photos', 6), submitReport);

module.exports = router;
