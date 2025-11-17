import express from "express";
import Incident from "../models/Incident.js";
import redis from "../utils/redisClient.js";
import openai from "../utils/openai.js";


const router = express.Router();

router.get("/incidents", async (req, res) => {
  const { dateFrom, dateTo, category, country, city, severity } = req.query;

  const cacheKey = `incidents:${dateFrom || 'all'}:${dateTo || 'all'}:${category || 'all'}:${country || 'all'}:${city || 'all'}:${severity || 'all'}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ incidents: JSON.parse(cached) });

    const query = {};
    if (dateFrom) query.createdAt = { $gte: new Date(dateFrom) };
    if (dateTo) query.createdAt = { ...query.createdAt, $lte: new Date(dateTo) };
    if (category) query.category = category;
    if (country) query.country = country;
    if (city) query.city = city;
    if (severity) query.severity = severity;

    const incidents = await Incident.find(query).sort({ createdAt: -1 });
    await redis.set(cacheKey, JSON.stringify(incidents), "EX", 300);

    res.json({ incidents });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching incidents" });
  }
});


/* -------------------------------------------------------------------------- */
/*                                  FORECAST                                  */
/* -------------------------------------------------------------------------- */

router.get("/forecast", async (req, res) => {
  const { country, city } = req.query;

  const cacheKey = `forecast:${country || "all"}:${city || "all"}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    // Fetch incidents
    const query = {};
    if (country) query.country = country;
    if (city) query.city = city;

    const incidents = await Incident.find(query).sort({ createdAt: 1 });

    if (!incidents.length) {
      return res.json({ forecast: [], insights: "No data available." });
    }

    // Build summary for OpenAI
    const summary = incidents.map((i) => ({
      date: i.createdAt.toISOString().split("T")[0],
      category: i.category,
      severity: i.severity,
      country: i.country,
      city: i.city,
    }));

    // Prompt you wrote — now actually USED
    const prompt = `
You are an AI assistant predicting incidents.

Based on the historical incident data below, return a JSON object with:
1. "forecast": a list of 7 objects, each with:
   - "date": YYYY-MM-DD
   - "predictedIncidents": number
   - "breakdown": {
       "low": number,
       "medium": number,
       "high": number,
       "critical": number
     }
2. "insights": a text summary of trends, including cities/countries with rising risks.

Only return valid JSON. Do not include backticks.

Historical data: ${JSON.stringify(summary)}
`;

    // OpenAI call — fixed to USE your prompt correctly
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI risk analysis assistant." },
        { role: "user", content: prompt }
      ]
    });

    let forecastData;

    try {
      forecastData = JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.error("❌ Invalid JSON from OpenAI:", response.choices[0].message.content);
      return res.status(500).json({
        error: "Forecast generation failed. The AI returned invalid JSON.",
      });
    }

    // Save to cache (10 mins)
    await redis.set(cacheKey, JSON.stringify(forecastData), "EX", 600);

    res.json(forecastData);

  } catch (err) {
    console.error("Forecast Error:", err);
    res.status(500).json({ message: "Error generating forecast" });
  }
});


/* -------------------------------------------------------------------------- */
/*                             HOTSPOT BY CITY                                */
/* -------------------------------------------------------------------------- */

router.get("/hotspots/cities", async (req, res) => {
  try {
    const cacheKey = "hotspot:cities";
    const cached = await redis.get(cacheKey);

    if (cached) return res.json(JSON.parse(cached));

    const result = await Incident.aggregate([
      {
        $group: {
          _id: { city: "$city", country: "$country" },
          count: { $sum: 1 },
          avgSeverity: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$severity", "low"] }, then: 1 },
                  { case: { $eq: ["$severity", "medium"] }, then: 2 },
                  { case: { $eq: ["$severity", "high"] }, then: 3 },
                  { case: { $eq: ["$severity", "critical"] }, then: 4 },
                ],
                default: 1,
              },
            },
          },
          location: { $first: { lat: "$lat", lng: "$lng" } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    await redis.set(cacheKey, JSON.stringify(result), "EX", 600);
    res.json(result);

  } catch (err) {
    console.error("City Hotspot Error:", err);
    res.status(500).json({ error: "Failed to compute city hotspots" });
  }
});


/* -------------------------------------------------------------------------- */
/*                           HOTSPOT BY COUNTRY                               */
/* -------------------------------------------------------------------------- */

router.get("/hotspots/countries", async (req, res) => {
  try {
    const cacheKey = "hotspot:countries";
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const result = await Incident.aggregate([
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
          avgSeverity: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$severity", "low"] }, then: 1 },
                  { case: { $eq: ["$severity", "medium"] }, then: 2 },
                  { case: { $eq: ["$severity", "high"] }, then: 3 },
                  { case: { $eq: ["$severity", "critical"] }, then: 4 },
                ],
                default: 1,
              },
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    await redis.set(cacheKey, JSON.stringify(result), "EX", 600);
    res.json(result);

  } catch (err) {
    console.error("Country Hotspot Error:", err);
    res.status(500).json({ error: "Failed to compute country hotspots" });
  }
});

export default router;
