import { z } from "zod";

export const SignUpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    phoneNumber: z.string().min(10).max(15),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const VerifyEmailOTPSchema = z.object({
  body: z.object({
    email: z.string().email(),
    emailOTP: z.string().min(6).max(6),
  }),
});

export const VerifyPhoneOTPSchema = z.object({
  body: z.object({
    email: z.string().email(),
    phoneOTP: z.string().min(6).max(6),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const ResetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().min(6).max(6),
    newPassword: z.string().min(6),
  }),
});
