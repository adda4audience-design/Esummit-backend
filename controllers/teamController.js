const Team = require('../models/Team');
const User = require('../models/User');

// --- 1. CREATE A TEAM ---
exports.createTeam = async (req, res, next) => {
    try {
        const { teamName } = req.body;
        if (!teamName) return res.status(400).json({ success: false, error: 'Team name is required.' });

        const newTeam = await Team.create({
            teamName,
            leader: req.user.id
        });

        res.status(201).json({ success: true, message: 'Team created successfully.', data: newTeam });
    } catch (error) {
        next(error);
    }
};

// --- 2. SEND INVITATION ---
exports.inviteMember = async (req, res, next) => {
    try {
        const { teamId, identifier } = req.body; // identifier = phone or ticketId

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ success: false, error: 'Team not found.' });
        if (team.leader.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Only the leader can invite members.' });

        // Find user by Ticket ID or Phone Number
        const guestUser = await User.findOne({ 
            $or: [{ ticketId: identifier }, { phoneNumber: identifier }] 
        });

        if (!guestUser) return res.status(404).json({ success: false, error: 'User not found.' });
        if (guestUser._id.toString() === req.user.id) return res.status(400).json({ success: false, error: 'You cannot invite yourself.' });

        // Check if already in team (Pending or Accepted)
        const alreadyInTeam = team.members.find(m => m.user.toString() === guestUser._id.toString());
        if (alreadyInTeam) return res.status(400).json({ success: false, error: 'User is already invited or in the team.' });

        team.members.push({ user: guestUser._id, status: 'Pending' });
        await team.save();

        res.status(200).json({ success: true, message: `Invitation sent to ${guestUser.fullName}.` });
    } catch (error) {
        next(error);
    }
};

// --- 3. ACCEPT/REJECT INVITATION ---
exports.respondToInvite = async (req, res, next) => {
    try {
        const { teamId, action } = req.body; // action = 'accept' or 'reject'
        
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ success: false, error: 'Team not found.' });

        const memberIndex = team.members.findIndex(m => m.user.toString() === req.user.id);
        if (memberIndex === -1) return res.status(404).json({ success: false, error: 'No invitation found for this team.' });

        if (action === 'accept') {
            team.members[memberIndex].status = 'Accepted';
            await team.save();
            return res.status(200).json({ success: true, message: 'You have joined the team!' });
        } else if (action === 'reject') {
            team.members.splice(memberIndex, 1); // Remove from array
            await team.save();
            return res.status(200).json({ success: true, message: 'Invitation declined.' });
        } else {
            return res.status(400).json({ success: false, error: 'Invalid action.' });
        }
    } catch (error) {
        next(error);
    }
};

// --- 4. OPT TEAM INTO EVENT ---
exports.registerTeamForEvent = async (req, res, next) => {
    try {
        const { teamId, eventName } = req.body;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ success: false, error: 'Team not found.' });
        if (team.leader.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Only the leader can register the team for events.' });

        if (team.events.includes(eventName)) {
            return res.status(400).json({ success: false, error: 'Team is already registered for this event.' });
        }

        team.events.push(eventName);
        await team.save();

        req.app.get('io').emit('mainframe_update');
        res.status(200).json({ success: true, message: `Team registered for ${eventName}.` });
    } catch (error) {
        next(error);
    }
};

// --- 5. GET USER'S TEAMS (Dashboard) ---
exports.getMyTeams = async (req, res, next) => {
    try {
        // Find teams where user is leader OR in the members array
        const teams = await Team.find({
            $or: [
                { leader: req.user.id },
                { 'members.user': req.user.id }
            ]
        }).populate('leader', 'fullName ticketId').populate('members.user', 'fullName ticketId');

        res.status(200).json({ success: true, data: teams });
    } catch (error) {
        next(error);
    }
};

// --- 6. GET ALL TEAMS (Admin Panel) ---
exports.getAllTeamsAdmin = async (req, res, next) => {
    try {
        const teams = await Team.find()
            .populate('leader', 'fullName email phoneNumber collegeName')
            .populate('members.user', 'fullName email phoneNumber collegeName');
            
        res.status(200).json({ success: true, count: teams.length, data: teams });
    } catch (error) {
        next(error);
    }
};