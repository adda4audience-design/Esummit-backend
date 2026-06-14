const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, protectAdmin } = require('../middleware/auth'); // IMPORT BOTH

router.post('/submit-utr', protect, paymentController.submitUpiPayment);

// SECURED Admin routes (Swapped 'protect' for 'protectAdmin')
router.post('/admin/verify-utr', protectAdmin, paymentController.verifyUpiPayment);
router.get('/admin/pending', protectAdmin, paymentController.getPendingPayments);

module.exports = router;