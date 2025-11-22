// seedUsers.js
import WebUser from "./models/WebUser.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "./utils/jwtManager.js";
import redis from "./utils/redisClient.js";

const seedUsers = async () => {
  try {
    // ---------- ADMIN ----------
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPhone = process.env.ADMIN_PHONE || "";

    if (!adminEmail || !adminPassword) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    }

    let admin = await WebUser.findOne({ email: adminEmail, role: "admin" });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = new WebUser({
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "admin",
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phoneNumber: adminPhone,
      });
      await admin.save();

      // Generate refresh token and store in Redis
      const { refreshToken, jti } = generateTokens(admin);
      await redis.set(`refreshToken:${jti}`, admin._id.toString(), "EX", 7 * 86400);

      console.log("✅ Admin seeded with refresh token");
    } else {
      console.log("✅ Admin already exists");
    }

    // ---------- EDITOR ----------
    const editorEmail = process.env.EDITOR_EMAIL;
    const editorPassword = process.env.EDITOR_PASSWORD;
    const editorPhone = process.env.EDITOR_PHONE || "";

    if (!editorEmail || !editorPassword) {
      console.warn("EDITOR_EMAIL and EDITOR_PASSWORD not set. Skipping editor seed.");
      return;
    }

    let editor = await WebUser.findOne({ email: editorEmail, role: "editor" });
    if (!editor) {
      const hashedPassword = await bcrypt.hash(editorPassword, 10);
      editor = new WebUser({
        email: editorEmail,
        passwordHash: hashedPassword,
        role: "editor",
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phoneNumber: editorPhone,
      });
      await editor.save();

      // Generate refresh token and store in Redis
      const { refreshToken, jti } = generateTokens(editor);
      await redis.set(`refreshToken:${jti}`, editor._id.toString(), "EX", 7 * 86400);

      console.log("✅ Editor seeded with refresh token");
    } else {
      console.log("✅ Editor already exists");
    }
  } catch (err) {
    console.error("❌ User seeding error:", err);
    // Optionally: send email alert in production
  }
};

export default seedUsers;
