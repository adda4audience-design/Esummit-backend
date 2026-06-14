const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    utrNumber: { type: String, required: true, unique: true }, // The 12-digit UPI reference
    amountCalculated: { type: Number, required: true }, 
    status: { type: String, enum: ['Pending Verification', 'Verified', 'Rejected'], default: 'Pending Verification' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);