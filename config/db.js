const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🟢 [SYSTEM] Core Database Online: ${conn.connection.host}`);
    } catch (error) {
        console.error(`🔴 [CRITICAL] Database Initialization Failed: ${error.message}`);
        process.exit(1); // Crash immediately if database fails
    }
};

module.exports = connectDB;