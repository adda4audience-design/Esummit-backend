const express = require('express');
const router = express.Router();
const goodyController = require('../controllers/goodyController');
const { protect, protectAdmin } = require('../middleware/auth');

router.post('/order', protect, goodyController.placeOrder);
router.get('/admin/orders', protectAdmin, goodyController.getAllOrders);
router.put('/admin/orders/status', protectAdmin, goodyController.updateOrderStatus);

module.exports = router; 