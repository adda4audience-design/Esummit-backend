const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Identity Information
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    
    // Registration Specifics
    delegateStatus: { type: String, enum: ['yes', 'no'], required: true },
    collegeName: { type: String, default: 'UIET KUK' },
    city: { type: String, default: 'Kurukshetra' },
    state: { type: String, default: 'Haryana' },
    needHostel: { type: Boolean, default: false },
    gender: { type: String }, // For non-UIET delegates
    
    // UIET Specifics
    branch: { type: String },
    year: { type: String },
    rollNo: { type: String },
    
    // Operational Tracking
    paymentStatus: { type: String, enum: ['Pending', 'Success'], default: 'Pending' },
    checkInStatus: { type: Boolean, default: false },
    hostelAllocated: { type: Boolean, default: false }, // Admin controlled allocation
    allocatedHostelName: { type: String },
    
    ticketId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);