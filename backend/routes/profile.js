// routes/profile.js
import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const user = req.user;
  res.json({ email: user.email, role: user.role, lastLogin: user.lastLogin });
});

router.get("/editor-only", requireAuth, requireRole(["editor"]), async (req, res) => {
  res.json({ secret: "editor data" });
});

export default router;
