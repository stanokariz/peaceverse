import express from "express";
import WebUser from "../models/WebUser.js";
import { generateTokens, verifyAccessToken, verifyRefreshToken } from "../utils/jwtManager.js";
import { sendOTP} from "../utils/mailer.js";
import {sendPhoneOTP} from "../utils/sendPhoneOTP.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import cookieParser from "cookie-parser";
import redis from "../utils/redisClient.js";


const router = express.Router();
router.use(cookieParser());

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  // sameSite: process.env.NODE_ENV === "production" || "lax",
  secure: process.env.NODE_ENV === "production",
};

// --- SIGNUP ---
router.post("/signup", rateLimiter, async (req, res) => {
  const { email, phoneNumber, password } = req.body;
  const existing = await WebUser.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email already registered" });

  const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  const newUser = new WebUser({
    email,
    phoneNumber,
    emailOTP,
    phoneOTP,
    emailOTPExpiry: otpExpiry,
    phoneOTPExpiry: otpExpiry,
  });
  // ✅ Hash password properly
  await newUser.setPassword(password);
  await newUser.save();

  await sendOTP(email, emailOTP);
  await sendPhoneOTP(phoneNumber, phoneOTP);

  res.json({ message: "OTP sent to email & phone" });
});

// --- VERIFY EMAIL OTP ---
// --- VERIFY EMAIL OTP ---
router.post("/verify-otp", async (req, res) => {
  const { email, emailOTP } = req.body; // <-- fix typo here
  const user = await WebUser.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.emailOTP !== emailOTP || new Date() > user.emailOTPExpiry)
    return res.status(400).json({ message: "Invalid or expired email OTP" });

  user.isEmailVerified = true;
  user.emailOTP = undefined;
  user.emailOTPExpiry = undefined;
  await user.save();

  res.json({ message: "Email verified" });
});


// --- VERIFY PHONE OTP ---
router.post("/verify-phone-otp", async (req, res) => {
  const { email, phoneOTP } = req.body;
  const user = await WebUser.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.phoneOTP !== phoneOTP || new Date() > user.phoneOTPExpiry)
    return res.status(400).json({ message: "Invalid or expired phone OTP" });

  user.isPhoneVerified = true;
  user.phoneOTP = undefined;
  user.phoneOTPExpiry = undefined;
  await user.save();

  res.json({ message: "Phone verified" });
});

// --- LOGIN ---
router.post("/login", rateLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await WebUser.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.isEmailVerified || !user.isPhoneVerified)
    return res.status(403).json({ message: "Email and phone must be verified" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  // Generate tokens
  const { accessToken, refreshToken, jti } = generateTokens(user);


  // Store refresh token in Redis for single session
  await redis.set(`refreshToken:${jti}`, user._id.toString(), "EX", 7 * 24 * 60 * 60);

  // Push user to DB
    user.isLoggedIn = true;
    user.lastLogin = new Date();
    await user.save();

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({ message: "Login successful", role: user.role });
});

// --- REFRESH TOKEN ---
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = verifyRefreshToken(refreshToken);
    const storedUserId = await redis.get(`refreshToken:${payload.jti}`);
    if (!storedUserId) return res.status(403).json({ message: "Refresh token revoked" });

    const user = await WebUser.findById(payload.sub);
    const { accessToken, refreshToken: newRefresh, jti: newJti } = generateTokens(user);

    // Rotate token
    await redis.del(`refreshToken:${payload.jti}`);
    await redis.set(`refreshToken:${newJti}`, user._id.toString(), "EX", 7 * 24 * 60 * 60);

    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefresh, cookieOptions)
      .json({ message: "Tokens refreshed" });
  } catch {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

// --- LOGOUT ---
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const payload = verifyRefreshToken(refreshToken);

    // remove token from Redis
    await redis.del(`refreshToken:${payload.jti}`);

    res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json({ message: "Logged out successfully" });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

// --- FORGOT PASSWORD ---
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await WebUser.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.emailOTP = otp;
  user.emailOTPExpiry = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  await sendOTP(email, otp);
  res.json({ message: "OTP sent for password reset" });
});

// --- RESET PASSWORD ---
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await WebUser.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.emailOTP !== otp || new Date() > user.emailOTPExpiry)
    return res.status(400).json({ message: "Invalid or expired OTP" });

  user.passwordHash = newPassword;
  user.emailOTP = undefined;
  user.emailOTPExpiry = undefined;
  await user.save();

  res.json({ message: "Password reset successfully" });
});

// --- ME (protected route) ---
router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
