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

    // Look up ONLY by email
    let admin = await WebUser.findOne({ email: adminEmail });

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

      // Generate refresh token for new admin
      const { refreshToken, jti } = generateTokens(admin);
      await redis.set(`refreshToken:${jti}`, admin._id.toString(), "EX", 7 * 86400);

      console.log("✅ Admin created and seeded with refresh token");
    } else {
      // If admin exists but role differs → update it
      if (admin.role !== "admin") {
        admin.role = "admin";
        await admin.save();
        console.log("🔄 Existing admin found — role updated to admin");
      } else {
        console.log("✅ Admin already exists");
      }
    }

    // ---------- EDITOR ----------
    const editorEmail = process.env.EDITOR_EMAIL;
    const editorPassword = process.env.EDITOR_PASSWORD;
    const editorPhone = process.env.EDITOR_PHONE || "";

    if (!editorEmail || !editorPassword) {
      console.warn("EDITOR_EMAIL and EDITOR_PASSWORD not set. Skipping editor seed.");
      return;
    }

    // Look up ONLY by email
    let editor = await WebUser.findOne({ email: editorEmail });

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

      // Generate refresh token for new editor
      const { refreshToken, jti } = generateTokens(editor);
      await redis.set(`refreshToken:${jti}`, editor._id.toString(), "EX", 7 * 86400);

      console.log("✅ Editor created and seeded with refresh token");
    } else {
      // If editor exists but role differs → update it
      if (editor.role !== "editor") {
        editor.role = "editor";
        await editor.save();
        console.log("🔄 Existing editor found — role updated to editor");
      } else {
        console.log("✅ Editor already exists");
      }
    }

  } catch (err) {
    console.error("❌ User seeding error:", err);
  }
};

export default seedUsers;
