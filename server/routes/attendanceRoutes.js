const express = require('express');
const { punchIn, punchOut, getMyAttendance, getTeamAttendance, validateAttendance } = require('../controllers/attendanceController');
const { protect,authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.get('/me', getMyAttendance);
router.get("/team", authorize("manager", "admin"), getTeamAttendance);
router.put('/:id/validate', authorize("manager", "admin"), validateAttendance);

module.exports = router;