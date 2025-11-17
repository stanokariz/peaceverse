import express from "express";
import WebUser from "../models/WebUser.js";
import {
  generateTokens,
  verifyRefreshToken,
} from "../utils/jwtManager.js";

import { sendOTP } from "../utils/mailer.js";
import { sendPhoneOTP } from "../utils/sendPhoneOTP.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import cookieParser from "cookie-parser";
import redis from "../utils/redisClient.js";
import { validate } from "../middleware/validate.js";

import {
  SignUpSchema,
  VerifyEmailOTPSchema,
  VerifyPhoneOTPSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../validators/authSchemas.js";

const router = express.Router();
router.use(cookieParser());

// const cookieOptions = {
//   httpOnly: true,
//   sameSite: "lax",
//   secure: process.env.NODE_ENV === "production",
// };

// ==============================
//  SIGNUP
// ==============================

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,                // cookies only over HTTPS in prod
  sameSite: isProd ? "strict" : "lax",
};


router.post(
  "/signup",
  rateLimiter,
  validate(SignUpSchema),
  asyncHandler(async (req, res) => {
    const { email, phoneNumber, password } = req.validated.body;

    const existing = await WebUser.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const emailOTP = String(Math.floor(100000 + Math.random() * 900000));
    const phoneOTP = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const newUser = new WebUser({
      email,
      phoneNumber,
      emailOTP,
      phoneOTP,
      emailOTPExpiry: otpExpiry,
      phoneOTPExpiry: otpExpiry,
    });

    await newUser.setPassword(password);
    await newUser.save();

    await sendOTP(email, emailOTP);
    await sendPhoneOTP(phoneNumber, phoneOTP);

    res.json({ message: "OTP sent to email & phone" });
  })
);

// ==============================
//  VERIFY EMAIL OTP
// ==============================
router.post(
  "/verify-otp",
  validate(VerifyEmailOTPSchema),
  asyncHandler(async (req, res) => {
    const { email, emailOTP } = req.validated.body;

    const user = await WebUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailOTP !== emailOTP || Date.now() > user.emailOTPExpiry)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified" });
  })
);

// ==============================
//  VERIFY PHONE OTP
// ==============================
router.post(
  "/verify-phone-otp",
  validate(VerifyPhoneOTPSchema),
  asyncHandler(async (req, res) => {
    const { email, phoneOTP } = req.validated.body;

    const user = await WebUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.phoneOTP !== phoneOTP || Date.now() > user.phoneOTPExpiry)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isPhoneVerified = true;
    user.phoneOTP = undefined;
    user.phoneOTPExpiry = undefined;
    await user.save();

    res.json({ message: "Phone verified" });
  })
);

// ==============================
//  LOGIN
// ==============================
router.post(
  "/login",
  rateLimiter,
  validate(LoginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.validated.body;

    const user = await WebUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isEmailVerified || !user.isPhoneVerified)
      return res
        .status(403)
        .json({ message: "Email and phone must be verified" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    const { accessToken, refreshToken, jti } = generateTokens(user);

    await redis.set(`refreshToken:${jti}`, user._id.toString(), "EX", 7 * 86400);

    user.isLoggedIn = true;
    user.lastLogin = new Date();
    await user.save();

    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({ message: "Login successful", role: user.role });
  })
);

// ==============================
//  REFRESH TOKEN
// ==============================
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token" });

    const payload = verifyRefreshToken(refreshToken);
    const storedUserId = await redis.get(`refreshToken:${payload.jti}`);

    if (!storedUserId)
      return res.status(403).json({ message: "Refresh token revoked" });

    const user = await WebUser.findById(payload.sub);
    const {
      accessToken,
      refreshToken: newRefresh,
      jti: newJti,
    } = generateTokens(user);

    await redis.del(`refreshToken:${payload.jti}`);
    await redis.set(`refreshToken:${newJti}`, user._id.toString(), "EX", 7 * 86400);

    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefresh, cookieOptions)
      .json({ message: "Tokens refreshed" });
  })
);

// ==============================
//  LOGOUT
// ==============================
router.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken);
      await redis.del(`refreshToken:${payload.jti}`);
    }

    res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json({ message: "Logged out successfully" });
  })
);

// ==============================
//  FORGOT PASSWORD
// ==============================
router.post(
  "/forgot-password",
  validate(ForgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.validated.body;

    const user = await WebUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.emailOTP = otp;
    user.emailOTPExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTP(email, otp);
    res.json({ message: "OTP sent for password reset" });
  })
);

// ==============================
//  RESET PASSWORD
// ==============================
router.post(
  "/reset-password",
  validate(ResetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.validated.body;

    const user = await WebUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailOTP !== otp || Date.now() > user.emailOTPExpiry)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    await user.setPassword(newPassword);

    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  })
);

// ==============================
//  ME
// ==============================
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

export default router;
