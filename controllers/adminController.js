// controllers/adminController.js
const Admin = require('../models/Admin.js');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const AdminLoginSchema = z.object({
    name: z.string().min(1, "Admin ID is required"),
    password: z.string().min(1, "Clearance Code is required")
});

exports.login = async (req, res, next) => {
    try {
        const validatedData = AdminLoginSchema.parse(req.body);

        // 1. Locate admin in database
        const admin = await Admin.findOne({ name: validatedData.name });
        if (!admin) {
            const error = new Error('Invalid Admin ID.');
            error.statusCode = 401;
            throw error;
        }

        // 2. Verify exact password match
        if (admin.password !== validatedData.password) {
            const error = new Error('Invalid Clearance Code.');
            error.statusCode = 401;
            throw error;
        }

        // 3. Mint an Admin-level JWT
        const token = jwt.sign(
            { id: admin._id, role: 'admin' }, // Critical: Note the 'role' property
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.status(200).json({
            success: true,
            message: 'Mainframe override successful.',
            token: token
        });

    } catch (error) {
        next(error);
    }
};