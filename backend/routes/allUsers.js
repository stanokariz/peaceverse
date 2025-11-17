import express from "express";
import WebUser from "../models/WebUser.js";
import redis from "../utils/redisClient.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get paginated, searchable list of users (Admin only)
 * @query search, page, limit
 */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const cacheKey = `users:page=${page}:limit=${limit}:search=${search}`;

    // 1️⃣ Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("⚡ Users served from Redis cache");
      return res.json(JSON.parse(cached));
    }

    const query = search
      ? {
          $or: [
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await WebUser.countDocuments(query);

    const users = await WebUser.find(query)
      .select("email role isActive isLoggedIn lastLogin createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const response = {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // 2️⃣ Atomic set to Redis + expiration
    await redis
      .multi()
      .set(cacheKey, JSON.stringify(response))
      .expire(cacheKey, 30) // fast-moving data, refresh every 30s
      .exec();

    res.json(response);
  } catch (err) {
    console.error("❌ Failed to fetch users", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/**
 * @route PATCH /api/users/:id
 * @desc Update user role or activation state — Admin only
 */
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role, isActive } = req.body;

    const user = await WebUser.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields safely
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // 3️⃣ Clear all user cache pages
    await redis.keys("users:*").then((keys) => {
      if (keys.length > 0) redis.del(keys);
    });

    res.json({ message: "User updated", user });
  } catch (err) {
    console.error("❌ Failed to update user:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

export default router;
