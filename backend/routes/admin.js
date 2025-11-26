import express from "express";
import redis from "../utils/redisClient.js";
import WebUser from "../models/WebUser.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const cacheKey = "siteStats";
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const now = new Date();
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // --- User stats ---
    const [totalUsers, newUsersToday, activeUsers, verifiedUsers, usersLast24h] =
      await Promise.all([
        WebUser.countDocuments(),
        WebUser.countDocuments({ createdAt: { $gte: new Date(today) } }),
        WebUser.countDocuments({ isLoggedIn: true }),
        WebUser.countDocuments({ isEmailVerified: true }),
        WebUser.countDocuments({ lastLogin: { $gte: last24h } }),
      ]);

    // --- Site visits ---
    const [totalVisits, todayVisits] = await Promise.all([
      redis.get("site:visits:total"),
      redis.get(`site:visits:${today}`),
    ]);

    // --- Top pages ---
    const pageKeys = await redis.keys("site:page:*:visits*");
    const pagesAllTime = {};
    const pagesToday = {};
    const pagesWeek = {};

    for (let key of pageKeys) {
      const count = parseInt(await redis.get(key)) || 0;
      const parts = key.split(":"); // site:page:<pageName>:visits[:<date>]
      const pageName = parts[2];
      const datePart = parts[4]; // optional date suffix

      if (!datePart) pagesAllTime[pageName] = (pagesAllTime[pageName] || 0) + count;
      else if (datePart === today) pagesToday[pageName] = (pagesToday[pageName] || 0) + count;
      else {
        // For weekly stats: check if the date is within last7d
        const date = new Date(datePart);
        if (!isNaN(date) && date >= last7d) {
          pagesWeek[pageName] = (pagesWeek[pageName] || 0) + count;
        }
      }
    }

    const sortPages = (pagesObj) =>
      Object.entries(pagesObj)
        .sort((a, b) => b[1] - a[1])
        .map(([page, visits]) => ({ page, visits }));

    const stats = {
      success: true,
      stats: {
        totalUsers,
        newUsersToday,
        activeUsers,
        verifiedUsers,
        usersLast24h,
        totalVisits: parseInt(totalVisits) || 0,
        todayVisits: parseInt(todayVisits) || 0,
        topPages: {
          allTime: sortPages(pagesAllTime),
          today: sortPages(pagesToday),
          last7Days: sortPages(pagesWeek),
        },
      },
    };

    await redis.set(cacheKey, JSON.stringify(stats), "EX", 60); // cache for 60s

    res.json(stats);
  } catch (err) {
    console.error("❌ Failed to fetch site statistics:", err);
    res.status(500).json({ success: false, message: "Failed to fetch site statistics" });
  }
});

export default router;
