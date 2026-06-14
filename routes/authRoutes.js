const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, protectAdmin } = require('../middleware/auth'); // IMPORT BOTH

// Public routes...
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected User routes...
router.get('/profile', protect, authController.getProfile); 
router.put('/profile', protect, authController.updateProfile);
router.post('/check-in', protect, authController.checkInDelegate);

// SECURED Admin routes (Swapped 'protect' for 'protectAdmin')
router.get('/admin/users', protectAdmin, authController.getAllUsers);
router.put('/admin/allocate-hostel', protectAdmin, authController.allocateHostelAdmin);
router.put('/admin/toggle-checkin', protectAdmin, authController.toggleCheckInAdmin); // NEW OVERRIDE

module.exports = router;