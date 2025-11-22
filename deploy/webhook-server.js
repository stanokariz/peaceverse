import express from "express";
import crypto from "crypto";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { exec } from "child_process";
import nodemailer from "nodemailer";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

// Save raw body for GitHub signature verification
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

const verifySignature = (req) => {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", process.env.GITHUB_SECRET);
  hmac.update(req.rawBody);

  const digest = `sha256=${hmac.digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

// Email sender
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendErrorEmail = async (error) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Peaceverse Deployment Error",
      text: `An error occurred during deployment:\n\n${error}`,
    });
  } catch (emailErr) {
    console.error("Email send failed:", emailErr);
  }
};

// MAIN WEBHOOK ROUTE ✔️
app.post("/deploy", (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).send("Invalid signature");
  }

  console.log("⚡ GitHub webhook received — deploying...");

  exec("bash deploy.sh", (err, stdout, stderr) => {
    if (err) {
      console.error("Deployment error:", err);
      sendErrorEmail(err.toString());
      return;
    }

    console.log(stdout);
  });

  res.status(200).send("Deployment started");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});