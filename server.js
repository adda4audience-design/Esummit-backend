const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes'); 

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*' }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`📡 [TELEMETRY] Command Dashboard connected to live feed.`);
});

// 1. Core Systems Initialization
connectDB();

// 2. Security Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000,
    message: { error: 'Too many server requests from this vector. Terminal locked for 15 minutes.' }
});
app.use('/api/', apiLimiter);

// 3. Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.get('/health', (req, res) => {
    res.status(200).send('Mainframe is active.');
});

// 4. Centralized Error Interceptor
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 [SYSTEM] Mainframe operating seamlessly on port ${PORT}`));