const GoodyOrder = require('../models/GoodyOrder');
const User = require('../models/User');

// --- USER FACING: PLACE COD ORDER ---
exports.placeOrder = async (req, res, next) => {
    try {
        const { itemType, variant, size } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User profile not found.' });
        }

        const newOrder = await GoodyOrder.create({
            userId: user._id,
            itemType,
            variant,
            size,
            paymentMethod: 'COD',
            status: 'Pending'
        });

        req.app.get('io').emit('mainframe_update');
        res.status(201).json({
            success: true,
            message: `${itemType} ordered successfully via Cash On Delivery!`
        });
    } catch (error) {
        next(error);
    }
};

// --- ADMIN FACING: GET ALL ORDERS ---
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await GoodyOrder.find()
            .populate('userId', 'fullName email phoneNumber collegeName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// --- ADMIN FACING: UPDATE ORDER STATUS ---
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId, status } = req.body;
        
        const order = await GoodyOrder.findByIdAndUpdate(
            orderId, 
            { status }, 
            { new: true, runValidators: true }
        );

        if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });

        req.app.get('io').emit('mainframe_update');
        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}.`
        });
    } catch (error) {
        next(error);
    }
};