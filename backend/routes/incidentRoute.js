import Incident from '../models/Incident.js';
import express from "express";
import { requireAuth } from "./../middleware/auth.js";

const router = express.Router();

// --- CREATE Incident ---
router.post("/", requireAuth, async (req, res) => {
  const { title, description, category, severity, city, country, lat, lng } = req.body;

  // Server-side validation
  if (!title || !description || !category || !severity || !city || !country || !lat || !lng) {
    return res.status(400).json({ message: "All fields (title, description, category, severity, city, country, lat, lng) are required" });
  }

  try {
    const incident = await Incident.create({
      userId: req.user._id,
      verifiedBy: null,
      title,
      description,
      category,
      severity,
      city,
      country,
      lat,
      lng,
    });
    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GET USER INCIDENT REPORTS ---
router.get("/user/:userId", requireAuth, async (req, res) => {
  try {
    const incidents = await Incident.find({ userId: req.params.userId })
      .populate('userId', 'email role country city')
      .populate('verifiedBy', 'email role')
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
