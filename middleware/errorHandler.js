// In middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Zod Validation Errors cleanly (UPDATED)
    if (err.name === 'ZodError') {
        statusCode = 400;
        // Safely extract the array whether it's named 'errors' or 'issues'
        const errorList = err.errors || err.issues || [];
        message = errorList.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    }

    console.error(`🚨 [ERROR LOG] ${req.method} ${req.url} - ${message}`);

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;