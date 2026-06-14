const Order = require('../models/Order');
const User = require('../models/User');
const { z } = require('zod');
const crypto = require('crypto');
const { sendTicketEmail } = require('../utils/emailService');

const UpiSubmissionSchema = z.object({
    utrNumber: z.string().length(12, "UTR must be exactly 12 digits long")
});

const calculateOfficialFee = (delegateStatus, needHostel) => {
    if (delegateStatus === 'yes') return 0;
    
    let fee = 300;
    if (needHostel) fee += 700;
    return fee;
};

// --- USER FACING: SUBMIT UTR ---
exports.submitUpiPayment = async (req, res, next) => {
    try {
        const validatedData = UpiSubmissionSchema.parse(req.body);

        const user = await User.findById(req.user.id);
        if (!user) {
            const error = new Error('User context not found');
            error.statusCode = 404;
            throw error;
        }

        const existingOrder = await Order.findOne({ utrNumber: validatedData.utrNumber });
        if (existingOrder) {
            const error = new Error('This UTR number has already been claimed.');
            error.statusCode = 400;
            throw error;
        }

        const expectedAmount = calculateOfficialFee(user.delegateStatus, user.needHostel);

        if (expectedAmount === 0) {
            user.paymentStatus = 'Success';
            await user.save();
            return res.status(200).json({
                success: true,
                message: 'UIET clearance granted. No payment required.'
            });
        }

        await Order.create({
            userId: user._id,
            utrNumber: validatedData.utrNumber,
            amountCalculated: expectedAmount,
            status: 'Pending Verification'
        });

        req.app.get('io').emit('mainframe_update');
        res.status(201).json({
            success: true,
            message: 'Payment details submitted. Your ticket will be issued once the finance team verifies the UTR.'
        });

    } catch (error) {
        next(error);
    }
};

// --- ADMIN FACING: VERIFY UTR ---
// --- ADMIN FACING: VERIFY UTR ---
exports.verifyUpiPayment = async (req, res, next) => {
    try {
        // NEW: Accept allocatedHostelName from admin panel
        const { utrNumber, action, allocateHostel, allocatedHostelName } = req.body; 

        const order = await Order.findOne({ utrNumber }).populate('userId');
        if (!order) {
            const error = new Error('No transaction found with this UTR.');
            error.statusCode = 404;
            throw error;
        }

        if (order.status !== 'Pending Verification') {
            const error = new Error(`Order is already ${order.status}.`);
            error.statusCode = 400;
            throw error;
        }

        if (action === 'approve') {
            order.status = 'Verified';
            await order.save();

            const user = order.userId;
            user.paymentStatus = 'Success';
            
            // Assign hostel and save the specific name
            if (allocateHostel) {
                user.hostelAllocated = true;
                if (allocatedHostelName) {
                    user.allocatedHostelName = allocatedHostelName;
                }
            }
            
            const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
            user.ticketId = `ES26-${randomHex}`;
            await user.save();

            sendTicketEmail(user.email, user.fullName, user.ticketId, user.allocatedHostelName).catch(err => {
                console.error('🚨 [MAILER ERROR] Failed to send ticket email:', err.message);
            });
            
            req.app.get('io').emit('mainframe_update');
            return res.status(200).json({
                success: true,
                message: `Payment verified. Ticket ${user.ticketId} issued to ${user.fullName}.`
            });
            
        } else if (action === 'reject') {
            order.status = 'Rejected';
            await order.save();

            req.app.get('io').emit('mainframe_update');
            return res.status(200).json({
                success: true,
                message: 'Payment rejected. User remains pending.'
            });
        } else {
            const error = new Error('Invalid action.');
            error.statusCode = 400;
            throw error;
        }

    } catch (error) {
        next(error);
    }
};

// --- ADMIN FACING: GET PENDING QUEUE ---
exports.getPendingPayments = async (req, res, next) => {
    try {
        const pendingOrders = await Order.find({ status: 'Pending Verification' })
            .populate('userId', 'fullName email collegeName gender needHostel')
            .sort({ createdAt: 1 });
  
        res.status(200).json({
            success: true,
            count: pendingOrders.length,
            data: pendingOrders
        });
    } catch (error) {
        next(error);
    }
};