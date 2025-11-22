import cron from "node-cron";
import WebUser from "../models/WebUser.js";
import WebUserDailyStats from "../models/WebUserDailyStats.js";
import nodemailer from "nodemailer";

// ----------------------
// Configure Nodemailer
// ----------------------
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ----------------------
// Cron: Run every 5 minutes to delete old unverified users
// ----------------------
cron.schedule("*/5 * * * *", async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  try {
    const unverifiedUsers = await WebUser.find({
      createdAt: { $lt: thirtyMinutesAgo },
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    if (unverifiedUsers.length === 0) return;

    // Store deleted users in daily stats
    await WebUserDailyStats.insertMany(
      unverifiedUsers.map(u => ({
        email: u.email,
        phoneNumber: u.phoneNumber,
        role: u.role,
        createdAt: u.createdAt,
        deletedAt: new Date(),
      }))
    );

    // Delete unverified users
    await WebUser.deleteMany({
      _id: { $in: unverifiedUsers.map(u => u._id) },
    });

  } catch (err) {
    console.error("Error deleting unverified users:", err);
  }
});

// ----------------------
// Cron: Daily email report at 23:59
// ----------------------
cron.schedule("59 23 * * *", async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const dailyDeletedUsers = await WebUserDailyStats.find({
      deletedAt: { $gte: yesterday },
    });

    if (dailyDeletedUsers.length === 0) return;

    // Count by role
    const roleCounts = dailyDeletedUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Build email HTML
    const roleSummaryHtml = Object.entries(roleCounts)
      .map(([role, count]) => `<li>${role}: ${count}</li>`)
      .join("");

    const html = `
      <h2>Daily Unverified Users Report</h2>
      <p><strong>Total Deleted Users:</strong> ${dailyDeletedUsers.length}</p>
      <h3>Deleted Users by Role:</h3>
      <ul>${roleSummaryHtml}</ul>
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Deleted At</th>
          </tr>
        </thead>
        <tbody>
          ${dailyDeletedUsers.map(u => `
            <tr>
              <td>${u.email}</td>
              <td>${u.phoneNumber || "-"}</td>
              <td>${u.role}</td>
              <td>${new Date(u.createdAt).toLocaleString()}</td>
              <td>${new Date(u.deletedAt).toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_REPORT_TO || process.env.EMAIL_USER,
      subject: "Daily Unverified Users Report",
      html,
    });

    // Optionally: delete old stats after reporting to save DB space
    await WebUserDailyStats.deleteMany({ deletedAt: { $lte: yesterday } });

    console.log("✅ Daily unverified users report sent and old stats cleared.");

  } catch (err) {
    console.error("Error sending daily report:", err);
  }
});
