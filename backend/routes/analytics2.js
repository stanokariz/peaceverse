import express from "express";
import Incident from "../models/Incident.js";
// import OpenAI from "openai";
import openai from "../utils/openai.js";
import generatePDFReport from "../utils/pdfGenerator.js";
import { io } from "../utils/websocket.js";

const router = express.Router();
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ==================================================================
   1. AI FORECAST (14 days)
   ================================================================== */
router.get("/forecast", async (req, res) => {
  try {
    const incidents = await Incident.find({}).sort({ createdAt: 1 });

    if (!incidents.length) {
      return res.json({
        forecast: [],
        riskLevel: "unknown",
        keyDrivers: [],
        summary: "No data available.",
      });
    }

    const daily = {};
    incidents.forEach(i => {
      const d = i.createdAt.toISOString().split("T")[0];
      daily[d] = (daily[d] || 0) + 1;
    });

    const ai = await openai.responses.create({
      model: "gpt-4.1",
      input: `
Using the daily incident counts below, generate a 14-day forecast.

Daily Counts:
${JSON.stringify(daily)}

Return EXACT JSON:
{
 "forecast": [{"date":"YYYY-MM-DD","predictedCount":number}],
 "riskLevel":"low|medium|high|critical",
 "keyDrivers":["string"],
 "summary":"short overview"
}
      `,
    });

    res.json(JSON.parse(ai.output_text));
  } catch (err) {
    res.status(500).json({ error: "Forecast generation error" });
  }
});


/* ==================================================================
   2. HEATMAP DATA
   ================================================================== */
router.get("/heatmap", async (_req, res) => {
  try {
    const incidents = await Incident.find({}, {
      lat: 1, lng: 1, severity: 1, category: 1, createdAt: 1
    });

    const weight = { low: 1, medium: 2, high: 4, critical: 8 };

    const heatmap = incidents.map(i => ({
      lat: i.lat,
      lng: i.lng,
      weight: weight[i.severity]
    }));

    res.json({ heatmap });
  } catch {
    res.status(500).json({ error: "Heatmap error" });
  }
});


/* ==================================================================
   3. HOTSPOT ANALYSIS (Geospatial + AI)
   ================================================================== */
router.get("/hotspots", async (_req, res) => {
  try {
    const incidents = await Incident.find({});

    const clusters = {};
    incidents.forEach(i => {
      const key = `${Math.round(i.lat * 10) / 10}-${Math.round(i.lng * 10) / 10}`;
      clusters[key] = clusters[key] || [];
      clusters[key].push(i);
    });

    const summaries = Object.entries(clusters).map(([key, points]) => {
      const [lat, lng] = key.split("-").map(Number);
      const sevWeight = { low: 1, medium: 2, high: 4, critical: 8 };

      return {
        lat,
        lng,
        totalIncidents: points.length,
        severityScore: points.reduce((s, p) => s + sevWeight[p.severity], 0),
        categories: points.reduce((m, p) => {
          m[p.category] = (m[p.category] || 0) + 1;
          return m;
        }, {})
      };
    });

    const ai = await openai.responses.create({
      model: "gpt-4.1",
      input: `
Analyze these geospatial clusters and identify the top 5 hotspots.

Data:
${JSON.stringify(summaries)}

Return EXACT JSON:
{
 "hotspots":[{"lat":num,"lng":num,"risk":"high","reason":"string"}],
 "summary":"string"
}
      `,
    });

    res.json(JSON.parse(ai.output_text));
  } catch {
    res.status(500).json({ error: "Hotspot error" });
  }
});


/* ==================================================================
   4. FULL INTELLIGENCE REPORT (Markdown)
   ================================================================== */
router.get("/report", async (_req, res) => {
  try {
    const incidents = await Incident.find({});

    const daily = {};
    incidents.forEach(i => {
      const d = i.createdAt.toISOString().split("T")[0];
      daily[d] = (daily[d] || 0) + 1;
    });

    const ai = await openai.responses.create({
      model: "gpt-4.1",
      input: `
Generate a full African Union Early Warning Intelligence Report.

Sections:
1. Executive Summary  
2. Trends  
3. Geospatial Hotspots  
4. Drivers  
5. Forecast  
6. Recommendations  

Data:
${JSON.stringify(daily)}

Return Markdown only.
      `,
    });

    res.json({ report: ai.output_text });
  } catch {
    res.status(500).json({ error: "Report generation failed" });
  }
});


/* ==================================================================
   5. PDF EXPORT
   ================================================================== */
router.get("/report/pdf", async (req, res) => {
  try {
    const markdown = req.query.md;
    const pdfBuffer = await generatePDFReport(markdown);

    res.set("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch {
    res.status(500).json({ error: "PDF generation failed" });
  }
});


/* ==================================================================
   6. LIVE UPDATES VIA WEBSOCKET
   ================================================================== */
router.get("/stream/live", (_req, res) => {
  io.emit("incidentUpdate", { updated: true });
  res.json({ pushed: true });
});

export default router;
