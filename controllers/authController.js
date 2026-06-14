const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { z } = require('zod');
const { sendWelcomeEmail } = require('../utils/emailService');

// --- SCHEMAS ---
const RegisterSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters long"),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
    email: z.string().email("Invalid email domain layout"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    delegateStatus: z.enum(['yes', 'no']),
    collegeName: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    needHostel: z.boolean().optional(),
    gender: z.string().optional(),
    branch: z.string().optional(),
    year: z.string().optional(),
    rollNo: z.string().optional()
});

const LoginSchema = z.object({
    email: z.string().email("Invalid email domain layout"),
    password: z.string().min(1, "Password is required")
});

const UpdateProfileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters long").optional(),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits").optional(),
    collegeName: z.string().optional(),
    gender: z.string().optional(),
    branch: z.string().optional(),
    year: z.string().optional(),
    rollNo: z.string().optional()
});

// --- REGISTRATION FUNCTION ---
exports.register = async (req, res, next) => {
    try {
        const validatedData = RegisterSchema.parse(req.body);

        const userExists = await User.findOne({ email: validatedData.email });
        if (userExists) {
            const error = new Error('Access profile already exists with this email');
            error.statusCode = 400;
            throw error;
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(validatedData.password, salt);

        let ticketId = undefined;
        let paymentStatus = 'Pending';

        if (validatedData.delegateStatus === 'yes') {
            paymentStatus = 'Success';
            const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
            ticketId = `ES26-${randomHex}`;
        }

        const newUser = await User.create({
            ...validatedData,
            password: hashedPassword,
            paymentStatus,
            ticketId
        });

        sendWelcomeEmail(newUser.email, newUser.fullName).catch(err => {
            console.error('🚨 [MAILER ERROR] Failed to send welcome email:', err.message);
        });

        req.app.get('io').emit('mainframe_update');
        res.status(201).json({
            success: true,
            message: 'Profile initialization success.',
            userId: newUser._id
        });
    } catch (error) {
        next(error);
    }
};

// --- LOGIN FUNCTION ---
exports.login = async (req, res, next) => {
    try {
        const validatedData = LoginSchema.parse(req.body);

        const user = await User.findOne({ email: validatedData.email });
        if (!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(validatedData.password, user.password);
        if (!isMatch) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        req.app.get('io').emit('mainframe_update');
        res.status(200).json({
            success: true,
            message: 'Access granted.',
            token: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                delegateStatus: user.delegateStatus
            }
        });

    } catch (error) {
        next(error);
    }
};

// --- GET PROFILE FUNCTION ---
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            const error = new Error('Profile not found in mainframe.');
            error.statusCode = 404;
            throw error;
        }

        const order = await Order.findOne({ userId: user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: user,
            order: order || null
        });
    } catch (error) {
        next(error);
    }
};

// --- UPDATE PROFILE FUNCTION ---
exports.updateProfile = async (req, res, next) => {
    try {
        const validatedData = UpdateProfileSchema.parse(req.body);
        
        const user = await User.findById(req.user.id);
        if (!user) {
            const error = new Error('Profile not found in mainframe.');
            error.statusCode = 404;
            throw error;
        }

        if (validatedData.fullName) user.fullName = validatedData.fullName;
        if (validatedData.phoneNumber) user.phoneNumber = validatedData.phoneNumber;
        if (validatedData.gender && user.delegateStatus === 'no') user.gender = validatedData.gender;
        if (validatedData.collegeName && user.delegateStatus === 'no') user.collegeName = validatedData.collegeName;
        
        if (user.delegateStatus === 'yes') {
            if (validatedData.branch) user.branch = validatedData.branch;
            if (validatedData.year) user.year = validatedData.year;
            if (validatedData.rollNo) user.rollNo = validatedData.rollNo;
        }

        await user.save();

        req.app.get('io').emit('mainframe_update');
        res.status(200).json({
            success: true,
            message: 'Profile records updated.',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// --- VOLUNTEER FACING: CHECK-IN DELEGATE ---
exports.checkInDelegate = async (req, res, next) => {
    try {
        const { ticketId } = req.body;

        const delegate = await User.findOne({ ticketId });
        
        if (!delegate) {
            return res.status(404).json({ success: false, error: 'INVALID PASS: Ticket not found in database.' });
        }

        if (delegate.checkInStatus) {
            return res.status(400).json({ success: false, error: `ACCESS DENIED: ${delegate.fullName} has already checked in.` });
        }

        delegate.checkInStatus = true;
        await delegate.save();

        req.app.get('io').emit('mainframe_update');
        res.status(200).json({
            success: true,
            message: `ACCESS GRANTED: Welcome ${delegate.fullName} (${delegate.collegeName})`,
            data: delegate
        });

    } catch (error) {
        next(error);
    }
};

// --- ADMIN FACING: GET ALL USERS ---
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// --- ADMIN FACING: DIRECT HOSTEL ALLOCATION ---
exports.allocateHostelAdmin = async (req, res, next) => {
    try {
        const { userId, hostelAllocated, allocatedHostelName } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        user.hostelAllocated = hostelAllocated;
        if (allocatedHostelName !== undefined) {
            user.allocatedHostelName = allocatedHostelName;
        }
        
        await user.save();

        req.app.get('io').emit('mainframe_update');
        res.status(200).json({
            success: true,
            message: `Hostel data updated for ${user.fullName}.`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// --- ADMIN FACING: MANUAL CHECK-IN OVERRIDE ---
exports.toggleCheckInAdmin = async (req, res, next) => {
    try {
        const { userId, checkInStatus } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found in mainframe.' });
        }

        user.checkInStatus = checkInStatus;
        await user.save();

        req.app.get('io').emit('mainframe_update');
        res.status(200).json({
            success: true,
            message: `Ingress status updated to ${checkInStatus} for ${user.fullName}.`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};