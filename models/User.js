const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Identity Information
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    
    // Role Details (NEW)
    role: { type: String, required: true },
    specificRole: { type: String },
    company: { type: String },

    // Registration Specifics
    delegateStatus: { type: String, enum: ['yes', 'no'], required: true },
    collegeName: { type: String, default: 'UIET KUK' },
    city: { type: String, default: 'Kurukshetra' },
    state: { type: String, default: 'Haryana' },
    needHostel: { type: Boolean, default: false },
    gender: { type: String }, 
    
    // UIET / Student Specifics
    branch: { type: String },
    year: { type: String },
    rollNo: { type: String },
    
    // Operational Tracking (Payment Removed)
    checkInStatus: { type: Boolean, default: false },
    hostelAllocated: { type: Boolean, default: false }, 
    allocatedHostelName: { type: String },
    registeredEvents: { type: [String], default: [] },
    referredBy: { type: String, default: null }, 
    referralCount: { type: Number, default: 0 },
    
    ticketId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);