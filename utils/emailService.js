// utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or whichever service you are using
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use an App Password, not your actual password
    }
});

const sendWelcomeEmail = async (userEmail, userName) => {
    const mailOptions = {
        from: `"E-Summit Mainframe" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Welcome to E-Summit | Profile Initialized',
        html: `
            <div style="font-family: 'Courier New', monospace; background-color: #030101; color: #f5f5f5; padding: 40px; border: 1px solid #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #e62b2b; text-transform: uppercase; border-bottom: 1px solid #45d204ff; padding-bottom: 10px;">Profile Created</h1>
                <p style="font-size: 16px;">Greetings <strong>${userName}</strong>,</p>
                <p style="font-size: 14px; color: #aaa;">Your Profile for E-Summit has been successfully Created.</p>
                
                <div style="background-color: rgba(252, 163, 17, 0.1); border-left: 3px solid #fca311; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0; color: #fca311; font-weight: bold;">Status: Note (for Non-Uietians): </p>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #ccc;">If you are a non-Uietian, please submit your UTR payment via the dashboard and wait for our Team to confirm and issue your pass.</p>
                </div>
                
                <p style="font-size: 12px; color: #666; margin-top: 30px;">End of transmission.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

const sendTicketEmail = async (userEmail, userName, ticketId, hostelName) => {
    const hostelText = hostelName 
        ? `<p style="margin: 5px 0; color: #2ecc71;">Hostel Mapping: <strong>${hostelName}</strong></p>` 
        : '';

    const mailOptions = {
        from: `"E-Summit Mainframe" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `E-Summit Pass Issued: ${ticketId}`,
        html: `
            <div style="font-family: 'Courier New', monospace; background-color: #030101; color: #f5f5f5; padding: 40px; border: 1px solid #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #11fc24ff; text-transform: uppercase; border-bottom: 1px solid #fca311; padding-bottom: 10px;">Payment Verified</h1>
                <p style="font-size: 16px;"><strong>${userName}</strong>, your UTR has been verified by Our Team.</p>
                
                <div style="background-color: rgba(230, 43, 43, 0.1); border: 1px solid #e62b2b; padding: 20px; text-align: center; margin: 30px 0;">
                    <p style="margin: 0; color: #aaa; font-size: 12px; text-transform: uppercase;">Official Pass ID</p>
                    <h2 style="margin: 10px 0 0 0; color: #e62b2b; font-size: 28px; letter-spacing: 3px;">${ticketId}</h2>
                </div>

                ${hostelText}
                
                <p style="font-size: 14px; color: #aaa; margin-top: 20px;">You can Download your Pass by logging in to the Website</p>
                <p style="font-size: 12px; color: #666; margin-top: 30px;">End of transmission.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail, sendTicketEmail };