const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const { sendWelcomeEmail } = require('./utils/emailService');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const goodyRoutes = require('./routes/goodyRoutes');
const teamRoutes = require('./routes/teamRoutes');

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
    "https://adminesummit.netlify.app", 
    "https://esummituietkuk.netlify.app",
    "http://127.0.0.1:5501"
];
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`📡 [TELEMETRY] Command Dashboard connected to live feed.`);
});

// 1. Core Systems Initialization
connectDB();

// 2. Security Middleware
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000,
    message: { error: 'Too many server requests from this vector. Terminal locked for 15 minutes.' }
});
app.use('/api/', apiLimiter);

// 3. Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Payment Routes Removed
app.use('/api/events', eventRoutes);
app.use('/api/goodies', goodyRoutes);
app.use('/api/teams', teamRoutes);

app.get('/health', (req, res) => {
    res.status(200).send('Mainframe is active.');
});

app.get('/test-email', async (req, res) => {
    // Grab an email from the URL, or default to a fallback
    const targetEmail = req.query.email;
    
    if (!targetEmail) {
        return res.status(400).send("Please provide an email: /test-email?email=yourname@gmail.com");
    }

    try {
        await sendWelcomeEmail(targetEmail, "Test User");
        res.status(200).send(`✅ SUCCESS! Test email sent to ${targetEmail}`);
    } catch (error) {
        console.error("Test Email Error:", error);
        res.status(500).send(`🚨 FAILED! Error: ${error.message}`);
    }
});

// 4. Centralized Error Interceptor
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 [SYSTEM] Mainframe operating seamlessly on port ${PORT}`));