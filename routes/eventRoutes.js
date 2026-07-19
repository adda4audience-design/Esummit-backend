const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, protectAdmin } = require('../middleware/auth');

router.post('/register', protect, eventController.registerForEvent);
router.get('/admin/stats', protectAdmin, eventController.getEventRegistrations);

module.exports = router;