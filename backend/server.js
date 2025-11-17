// server.js
import "dotenv/config";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import errorHandler from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import allUsers from "./routes/allUsers.js";
import allIncidents from "./routes/allIncidents.js";
import peaceStoryRoutes from "./routes/peaceStories.js";
import incidentRoute from "./routes/incidentRoute.js";
import heatMapRoute from "./routes/heatMapRoute.js";
import analyticsRoute from "./routes/analytics.js";

import { initWebsocket } from "./utils/websocket.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------ Middlewares ------------------
app.use(
  cors({
    origin: process.env.ORIGIN, // Strict origin
    credentials: true,
  })
);

// 2) helmet AFTER CORS (to avoid blocking cookies)
app.use(helmet({
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.ORIGIN, // Strict origin
    credentials: true,
  })
);

// ------------------ API Routes ------------------
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/peace-stories", peaceStoryRoutes);
app.use("/api/incidents", incidentRoute);
app.use("/api/users", allUsers);
app.use("/api/incidents/all", allIncidents);
app.use("/api/incidents/heatmap", heatMapRoute);
app.use("/api", analyticsRoute); // consistent prefix

// ------------------ 404 Handler ------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ------------------ Error Handler (MUST BE LAST) ------------------
app.use(errorHandler);

// ------------------ HTTP server wrapper for WebSockets ------------------
const server = http.createServer(app);

// Initialize WebSocket server
initWebsocket(server);

// ------------------ Database + Server Start ------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server with WebSocket running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ------------------ Optional: Catch global unhandled errors ------------------
// Prevents server crash on unexpected async errors
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Optionally: process.exit(1);
});
