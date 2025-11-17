import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password recommended
  },
   tls: {
        // Keep strict in production; don't disable unless you know what you're doing
        rejectUnauthorized: true,
      },
  });

export const sendOTP = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Peace-Verse" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Code",
      replyTo: "no-reply@peaceverse.com",
      html: `
      <div style="font-family: Arial, sans-serif; background: #f3f4f6; padding: 20px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0ea5e9, #84cc16, #f97316, #fde047); border-radius: 12px; padding: 30px; color: #111827;">
          <h2 style="margin-bottom: 10px; font-size: 28px;">Peace-Verse Verification</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">Use the OTP below to complete your action. This code expires in <strong>5 minutes</strong>.</p>

          <p style="
            font-size: 36px; 
            font-weight: bold; 
            margin: 20px 0; 
            letter-spacing: 6px; 
            color: #fff; 
            background: #1e3a8a; 
            display: inline-block; 
            padding: 15px 25px; 
            border-radius: 12px;
            animation: pulse 1.5s infinite;
          ">
            ${otp}
          </p>

          <p style="font-size: 14px; margin-top: 30px; color: #111827;">If you did not request this, please ignore this email.</p>
          <p style="font-size: 12px; margin-top: 5px; color: #374151;">This is an automated message. Please do not reply.</p>

          <style>
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          </style>
        </div>
      </div>
      `,
    });

    console.log(`✅ OTP sent to ${to}: ${otp}`);
  } catch (err) {
    console.error("❌ Failed to send OTP:", err.message);
    throw err;
  }
};
