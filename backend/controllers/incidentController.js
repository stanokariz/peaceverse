import Incident from '../models/Incident.js';
import express from "express"
import { requireAuth } from "./../middleware/auth.js"; // your existing auth

const router = express.Router();

// --- CREATE Incident ---
router.post("/", requireAuth, async (req, res) => {
  const { title, description, type, severity, city, country, lat, lng } = req.body;
  if (!title || !message) return res.status(400).json({ message: "Title description type and severity are required" });

  try {
    const incident = await Incident.create({
      userId: req.user._id,
      title,
      description,
      type,
      severity,
      city,
      country,
      lat,
      lng,
    });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- GET USER INCIDENT REPORTS ---
router.get("/user/:userId", requireAuth, async (req, res) => {
  try {
    const incidents = await Incident.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;


// // Get all incidents for logged-in user
// export const getMyIncidents = async (req, res) => {
//   try {
//     const incidents = await Incident.find({ user: req.user._id }).sort({ createdAt: -1 });
//     res.status(200).json(incidents);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch incidents' });
//   }
// };

// // Create a new incident
// export const createIncident = async (req, res) => {
//   try {
//     const incident = await Incident.create({
//       ...req.body,
//       user: req.user._id,
//     });
//     res.status(201).json(incident);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to create incident' });
//   }
// };

// // Delete an incident by ID
// export const deleteIncident = async (req, res) => {
//   try {
//     const incident = await Incident.findOneAndDelete({ _id: req.params.id, user: req.user._id });
//     if (!incident) return res.status(404).json({ message: 'Incident not found' });
//     res.status(200).json({ message: 'Incident deleted' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to delete incident' });
//   }
// };
