const express =require('express');
const {protect} = require('../middleware/authMiddleware');
const {getDailyReport} = require('../controllers/reportController');

const router = express.Router();
router.use(protect);
router.get('/daily', getDailyReport);

module.exports = router;