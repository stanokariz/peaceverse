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
      .select("email role isActive isLoggedIn lastLogin createdAt phoneNumber")
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

    // 2️⃣ Cache results
    await redis
      .multi()
      .set(cacheKey, JSON.stringify(response))
      .expire(cacheKey, 30)
      .exec();

    res.json(response);
  } catch (err) {
    console.error("❌ Failed to fetch users", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/**
 * @route PATCH /api/users/:id
 * @desc Update user role or activation — Admin only
 */
/**
 * @route PATCH /api/users/:id
 * @desc Update user email OR role OR activation — Admin only
 */
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role, isActive, email } = req.body;

    const user = await WebUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent modifying admin role/active status
    if (user.role === "admin" && (role || isActive !== undefined)) {
      return res.status(400).json({
        message: "Admin accounts cannot be modified",
      });
    }

    // Allow email updates
    if (email) user.email = email;

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Clear cached user lists
    const keys = await redis.keys("users:*");
    if (keys.length > 0) await redis.del(keys);

    res.json({ message: "User updated", user });
  } catch (err) {
    console.error("❌ Failed to update user:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});


/**
 * @route DELETE /api/users/:id
 * @desc Delete user — Admin only
 */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await WebUser.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❗ Prevent deletion of admins (recommended)
    if (user.role === "admin") {
      return res.status(400).json({
        message: "Admin accounts cannot be deleted",
      });
    }

    await WebUser.findByIdAndDelete(req.params.id);

    // ❗ Clear Redis cache after deleting user
    const keys = await redis.keys("users:*");
    if (keys.length > 0) await redis.del(keys);

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("❌ Failed to delete user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Multi-delete users
router.post("/batch-delete", requireAuth, requireAdmin, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: "IDs must be an array" });
  }

  // Prevent deleting admins
  const admins = await WebUser.find({ _id: { $in: ids }, role: "admin" });
  if (admins.length > 0) {
    return res.status(400).json({ message: "Cannot delete admin accounts" });
  }

  await WebUser.deleteMany({ _id: { $in: ids } });

  // clear cache
  const keys = await redis.keys("users:*");
  if (keys.length > 0) await redis.del(keys);

  res.json({ message: "Users deleted" });
});

export default router;
