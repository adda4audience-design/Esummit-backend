const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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
                    <p style="margin: 0; color: #fca311; font-weight: bold;">Status: All Systems Go</p>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #ccc;">Your digital pass has been authorized. You can Resgiter for Events directly from your dashboard.</p>
                </div>
                
                <!-- NEW DASHBOARD BUTTON START -->
                <div style="text-align: center; margin-top: 35px; margin-bottom: 15px;">
                    <a href="https://esummituietkuk.netlify.app/dashboard.html" style="background-color: #ff3300; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 3px; border-radius: 4px; display: inline-block; border: 1px solid #ff3300;">
                        Access Dashboard
                    </a>
                </div>
                <!-- NEW DASHBOARD BUTTON END -->

                <p style="font-size: 12px; color: #666; margin-top: 30px;">End of transmission.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// ... keep sendTicketEmail as is, if you plan to use it for admin manual triggering or other events, otherwise it can be removed as well.
module.exports = { sendWelcomeEmail };