// routes/incidentsAdminRoutes.js
import express from "express";
import Incident from "../models/Incident.js";
import { requireAuth } from "./../middleware/auth.js";

const router = express.Router();

// --- GET ALL INCIDENTS (public, for PeaceRadio) ---
router.get("/public", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      country,
      city,
      category,
      severity,
      verified,
      dateFrom,
      dateTo,
      q,
      sortBy = "createdAt",
      sortDir = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (country) filter.country = country;
    if (city) filter.city = city;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (verified === "true") filter.isVerified = true;
    if (verified === "false") filter.isVerified = false;

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { city: regex },
        { country: regex },
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const allowedSortFields = [
      "title",
      "createdAt",
      "category",
      "severity",
      "city",
      "country",
      "isVerified",
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortObj = {};
    sortObj[sortField] = sortDir === "asc" ? 1 : -1;

    const [total, incidents] = await Promise.all([
      Incident.countDocuments(filter),
      Incident.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
    ]);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Math.max(1, Number(limit))),
      incidents,
    });
  } catch (err) {
    console.error("GET /api/incidents/all/public error:", err);
    res.status(500).json({ message: err.message });
  }
});


router.patch("/verify/:id", requireAuth, async (req, res) => {
  try {
    if (!["editor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { isVerified } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    incident.isVerified = !!isVerified;
    incident.verifiedBy = incident.isVerified ? req.user._id : null;
    await incident.save();

    const populated = await Incident.findById(id)
      .populate("userId", "name email country city role")
      .populate("verifiedBy", "name email role")
      .lean();

    res.json(populated);
  } catch (err) {
    console.error("PATCH /api/incidents/verify/:id error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/incidents/:id
 * Admins can delete any; users can delete their own.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    if (req.user.role !== "admin" && incident.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this incident" });
    }

    await Incident.findByIdAndDelete(id);
    res.json({ message: "Incident deleted" });
  } catch (err) {
    console.error("DELETE /api/incidents/:id error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
