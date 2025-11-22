import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const webUserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "editor", "admin"], default: "user" },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailOTP: String,
  emailOTPExpiry: Date,
  isPhoneVerified: { type: Boolean, default: false },
  phoneOTP: String,
  phoneOTPExpiry: Date,
  phoneNumber: String,
  isLoggedIn: { type: Boolean, default: false },
  lastLogin: Date,
  newPoints: { type: Number, default: 0 },
}, 
{
  timestamps: true,
});

// --- TTL index for unverified users ---
// MongoDB will automatically delete documents that match this filter after 30 minutes
webUserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 30 * 60, // 30 minutes
    partialFilterExpression: {
      isEmailVerified: false,
      isPhoneVerified: false,
    },
  }
);

// Virtual for setting password
webUserSchema.methods.setPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

webUserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.models.WebUser || mongoose.model("WebUser", webUserSchema);
