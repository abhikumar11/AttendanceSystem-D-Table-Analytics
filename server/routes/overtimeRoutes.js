const express = require('express');
const { requestOvertime, getMyOvertime, getPendingOvertime, reviewOvertime } = require('../controllers/overtimeController');
const { protect,authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/request', authorize('employee', 'manager'), requestOvertime);
router.get('/mine', authorize('employee', 'manager'), getMyOvertime);
router.get('/pending', authorize('manager', 'admin'), getPendingOvertime);
router.put('/:id', authorize('manager', 'admin'), reviewOvertime);

module.exports = router;
