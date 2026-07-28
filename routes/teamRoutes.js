const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect, protectAdmin } = require('../middleware/auth');

// Protected User Routes (Dashboard operations)
router.post('/create', protect, teamController.createTeam);
router.post('/invite', protect, teamController.inviteMember);
router.put('/respond', protect, teamController.respondToInvite);
router.post('/register-event', protect, teamController.registerTeamForEvent);
router.get('/my-teams', protect, teamController.getMyTeams);

// Protected Admin Routes (Admin Panel operations)
router.get('/admin/all', protectAdmin, teamController.getAllTeamsAdmin);

module.exports = router;