// middleware/auth.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: decoded.id };
            next();
        } catch (error) {
            res.status(401).json({ success: false, error: 'Not authorized, token failed or expired' });
        }
    }
    if (!token) {
        res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
    }
};

// NEW: Strict Admin Security Layer
const protectAdmin = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check for the admin role clearance
            if (decoded.role !== 'admin') {
                return res.status(403).json({ success: false, error: 'ACCESS DENIED: Insufficient clearance level.' });
            }

            req.admin = { id: decoded.id };
            next();
        } catch (error) {
            res.status(401).json({ success: false, error: 'Not authorized, token failed or expired' });
        }
    }
    if (!token) {
        res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
    }
};

module.exports = { protect, protectAdmin };