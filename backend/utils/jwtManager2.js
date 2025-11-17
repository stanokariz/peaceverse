// utils/jwtManager.js
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_EXP = process.env.JWT_ACCESS_EXPIRE || "15m";
const REFRESH_EXP = process.env.JWT_REFRESH_EXPIRE || "7d";
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "123";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "456";

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  console.warn("JWT secrets not configured in .env");
}

export function createJti() {
  return crypto.randomBytes(16).toString("hex");
}

export function signAccessToken(user) {
  const payload = { sub: user._id.toString(), role: user.role, type: "access" };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
}

export function signRefreshToken(user, jti) {
  const payload = { sub: user._id.toString(), jti, type: "refresh" };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}
