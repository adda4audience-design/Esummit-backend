const User = require('../models/User');

// --- USER FACING: REGISTER FOR EVENT ---
exports.registerForEvent = async (req, res, next) => {
    try {
        const { eventName } = req.body;
        if (!eventName) {
            return res.status(400).json({ success: false, error: 'Event name is required.' });
        }

            // Inside eventController.registerForEvent

            const TEAM_EVENTS = [
                "36 hours hackathon", 
                "IPL Auction simulation", 
                "The Big Bang theory", 
                "Pitch please competition"
            ];

            // Check before processing the registration
            if (TEAM_EVENTS.includes(req.body.eventName)) {
                return res.status(400).json({
                    success: false,
                    error: "This is a team event. Please register through the team dashboard."
                });
            }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User profile not found.' });
        }

        // Check if already registered
        if (user.registeredEvents.includes(eventName)) {
            return res.status(400).json({ success: false, error: `You are already registered for ${eventName}.` });
        }

        user.registeredEvents.push(eventName);
        await user.save();

        req.app.get('io').emit('mainframe_update'); // Trigger live update to admin
        res.status(200).json({
            success: true,
            message: `Successfully registered for ${eventName}!`
        });

    } catch (error) {
        next(error);
    }
};

// --- ADMIN FACING: GET EVENT STATS ---
exports.getEventRegistrations = async (req, res, next) => {
    try {
        // Find all users who have at least one registered event
        const users = await User.find({ 'registeredEvents.0': { $exists: true } })
                                .select('fullName email phoneNumber collegeName role delegateStatus registeredEvents');
        
        // Aggregate data by event
        const eventMap = {};
        
        users.forEach(user => {
            user.registeredEvents.forEach(eventName => {
                if (!eventMap[eventName]) {
                    eventMap[eventName] = { eventName, count: 0, users: [] };
                }
                eventMap[eventName].count += 1;
                eventMap[eventName].users.push(user);
            });
        });

        // Convert map to array
        const eventStats = Object.values(eventMap);

        res.status(200).json({
            success: true,
            data: eventStats
        });
    } catch (error) {
        next(error);
    }
};