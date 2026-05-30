const express = require('express');
const { protect,authorize } = require('../middleware/authMiddleware');
const { getAllUsers, getSystemAttendance, assignRole } = require('../controllers/adminController');

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.get('/attendance', getSystemAttendance);
router.put('/assign-manager', assignRole);
module.exports = router;