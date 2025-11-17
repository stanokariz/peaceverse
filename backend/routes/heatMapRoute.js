import express from "express";
import Incident from "../models/Incident.js";
import { requireAuth } from "./../middleware/auth.js";
import redis from "../utils/redisClient.js"; // ioredis instance

const router = express.Router();

// --- GET INCIDENTS FOR HEATMAP (YEARLY OR MONTHLY DETAILED) ---
router.get("/heatmap", requireAuth, async (req, res) => {
  try {
    // --- Role check ---
    if (!["editor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { year, category, severity, verified, country, city, detailed } = req.query;
    if (!year) return res.status(400).json({ message: "Year is required" });

    // --- Redis caching key ---
    const cacheKey = `heatmap:${year}:${category || "all"}:${severity || "all"}:${verified || "all"}:${country || "all"}:${city || "all"}:${detailed || "false"}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    // --- Build MongoDB filter ---
    const filter = {
      createdAt: {
        $gte: new Date(`${year}-01-01T00:00:00Z`),
        $lte: new Date(`${year}-12-31T23:59:59Z`),
      },
    };
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (verified === "true") filter.isVerified = true;
    if (verified === "false") filter.isVerified = false;
    if (country) filter.country = country;
    if (city) filter.city = city;

    let result;

    if (detailed === "true") {
      // --- DAILY AGGREGATION PER MONTH ---
      const incidentsByMonthDay = await Incident.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
            count: { $sum: 1 },
            incidents: { $push: "$$ROOT" },
          },
        },
        { $sort: { "_id.month": 1, "_id.day": 1 } },
      ]);

      const months = Array.from({ length: 12 }, (_, i) => {
        const monthNumber = i + 1;
        const monthIncidents = incidentsByMonthDay.filter(d => d._id.month === monthNumber);
        const numDays = new Date(year, monthNumber, 0).getDate();

        const days = Array.from({ length: numDays }, (_, dayIndex) => {
          const dayData = monthIncidents.find(d => d._id.day === dayIndex + 1);
          return {
            day: dayIndex + 1,
            count: dayData ? dayData.count : 0,
            incidents: dayData ? dayData.incidents : [],
          };
        });

        return {
          month: monthNumber,
          days,
          count: days.reduce((sum, d) => sum + d.count, 0),
        };
      });

      result = { year, months, total: months.reduce((sum, m) => sum + m.count, 0) };
    } else {
      // --- MONTHLY AGGREGATION ONLY ---
      const incidentsByMonth = await Incident.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            count: { $sum: 1 },
            incidents: { $push: "$$ROOT" },
          },
        },
        { $sort: { "_id.month": 1 } },
      ]);

      const months = Array.from({ length: 12 }, (_, i) => {
        const monthData = incidentsByMonth.find(m => m._id.month === i + 1);
        return {
          month: i + 1,
          count: monthData ? monthData.count : 0,
          incidents: monthData ? monthData.incidents : [],
        };
      });

      result = { year, months, total: months.reduce((sum, m) => sum + m.count, 0) };
    }

    // --- Cache result for 10 minutes ---
    await redis.set(cacheKey, JSON.stringify(result), "EX", 600);

    res.json(result);
  } catch (err) {
    console.error("GET /api/incidents/heatmap error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
