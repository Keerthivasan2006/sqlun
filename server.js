const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const path = require('path');

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));
// In-memory OTP store (use DB in production)
let otpStore = {};


// ✅ Configure transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sqlaundry360@gmail.com',  // your Gmail
        pass: 'idok fmul ejvx kihm'        // ⚠️ use Gmail App Password, not your real password
    }
});

// ✅ API: Send OTP
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    try {
  await transporter.sendMail({
    from: '"SQ Laundry 360" <sqlaundry360@gmail.com>',
    to: email,
    subject: "🧺 SQ Laundry - Your OTP Code",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        
        <!-- Header -->
        <div style="background-color: #00a8e8; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">SQ Laundry</h1>
          <p style="color: white; margin: 5px 0 0;">Premium Laundry Services</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border: 1px solid #e1e1e1;">
          <h2 style="color: #00a8e8; margin-top: 0;">Your One-Time Password</h2>
          
          <p>Hello,</p>
          <p>We received a request to log in to your SQ Laundry account. Use the following OTP to verify your login:</p>
          
          <!-- OTP Box -->
          <div style="background-color: #e6f7ff; padding: 15px; text-align: center; margin: 20px 0; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #00a8e8; border: 2px dashed #00a8e8;">
            ${otp}
          </div>
          
          <p>This OTP will expire in <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          
          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; text-align: center;">
            <p style="font-size: 14px; color: #777;">Need help? Contact our <a href="mailto:sqlaundry360@gmail.com" style="color: #00a8e8;">support team</a></p>
            <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} SQ Laundry. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
    text: `
      SQ Laundry - OTP Verification
      -----------------------------
      Hello,

      Your OTP code is: ${otp}

      This code will expire in 5 minutes. Please do not share it with anyone.

      If you didn't request this, you can safely ignore this email.

      Need help? Contact: sqlaundry360@gmail.com

      © ${new Date().getFullYear()} SQ Laundry. All rights reserved.
    `
  });

  res.json({ success: true, message: "OTP sent successfully" });
} catch (error) {
  console.error(error);
  res.json({ success: false, message: "Error sending OTP" });
}

});

// ✅ API: Verify OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.json({ success: false, message: "Email and OTP required" });
    }

    if (otpStore[email] && otpStore[email] === otp) {
        delete otpStore[email]; // OTP can be used only once
        return res.json({
            success: true,
            token: "auth-" + Date.now(),
            isNewUser: Math.random() > 0.5
        });
    } else {
        return res.json({ success: false, message: "Invalid OTP" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
