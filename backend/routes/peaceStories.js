import express from "express";
import PeaceStory from "../models/PeaceStory.js";
import WebUser from "../models/WebUser.js";
import { requireAuth } from "../middleware/auth.js";
import redis from "../utils/redisClient.js";

const router = express.Router();

// --- CREATE STORY ---
router.post("/", requireAuth, async (req, res) => {
  const { title, message, city, country, lat, lng } = req.body;
  if (!title || !message || !lat || !lng) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Sanitize inputs
    const safeTitle = title.trim();
    const safeMessage = message.trim();
    const safeCity = city.trim();
    const safeCountry = country.trim();

    const story = await PeaceStory.create({
      userId: req.user._id,
      title: safeTitle,
      message: safeMessage,
      city: safeCity,
      country: safeCountry,
      lat,
      lng,
    });

    // Increment points
    const redisKey = `user:${req.user._id}:points`;
    let newPoints;
    try {
      newPoints = await redis.incrBy(redisKey, 10);
      await redis.expire(redisKey, 60 * 60 * 24 * 30); // 30 days
      WebUser.findByIdAndUpdate(req.user._id, { $inc: { newPoints: 10 } }).catch(
        (err) => console.error("Mongo sync failed:", err.message)
      );
    } catch {
      const updatedUser = await WebUser.findByIdAndUpdate(
        req.user._id,
        { $inc: { newPoints: 10 } },
        { new: true }
      );
      newPoints = updatedUser.newPoints;
    }

    await redis.del(`user:${req.user._id}:stories`);
    res.status(201).json({ story, newPoints });
  } catch (err) {
    console.error("Error creating peace story:", err);
    res.status(500).json({ message: err.message });
  }
});

// --- GET USER STORIES ---
router.get("/user/:userId", requireAuth, async (req, res) => {
  try {
    const redisKey = `user:${req.params.userId}:stories`;
    const cached = await redis.get(redisKey);
    if (cached) return res.json(JSON.parse(cached));

    const stories = await PeaceStory.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();

    await redis.set(redisKey, JSON.stringify(stories), "EX", 600); // 10 min
    res.json(stories);
  } catch (err) {
    console.error("Error fetching stories:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
