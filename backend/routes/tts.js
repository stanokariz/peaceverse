import express from "express";
import OpenAI from "openai";
import "dotenv/config";
const router = express.Router();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/generate", async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Generate speech using OpenAI
    const audio = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      input: text,
      voice: voice || "alloy",
      format: "mp3",
    });

    const buffer = Buffer.from(await audio.arrayBuffer());

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length,
    });

    res.send(buffer);

  } catch (err) {
    console.error("TTS ERROR:", err);
    res.status(500).json({ error: "Failed to generate TTS audio" });
  }
});

export default router;
