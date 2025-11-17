import crypto from "crypto";
import bcrypt from "bcryptjs";

// create numeric OTP and hashed store
export function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  return otp;
}

export async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

export async function compareOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}
