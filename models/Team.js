const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['Pending', 'Accepted'], default: 'Pending' }
    }],
    events: [{ type: String }] // List of events this team is registered for
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);