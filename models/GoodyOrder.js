const mongoose = require('mongoose');

const GoodyOrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['Bag', 'Cap', 'T-Shirt'], required: true },
    variant: { type: String }, // E.g., 'Black', 'Variant 2'
    size: { type: String }, // E.g., 'M', 'L'
    quantity: { type: Number, default: 1 },
    paymentMethod: { type: String, default: 'COD' },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('GoodyOrder', GoodyOrderSchema);