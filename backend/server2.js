// server.js
import "dotenv/config";
import http from "http";                // <-- Add this
import express from "express";
import mongoose from "mongoose";
import helmet from 'helmet';
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import allUsers from "./routes/allUsers.js";
import allIncidents from "./routes/allIncidents.js";
import peaceStoryRoutes from "./routes/peaceStories.js";
import incidentRoute from "./routes/incidentRoute.js";
import heatMapRoute from "./routes/heatMapRoute.js";
import analyticsRoute from "./routes/analytics.js";
import { initWebsocket } from "./utils/websocket.js";   // <-- Add this

const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    // origin: process.env.ORIGIN || "http://localhost:5173",
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/peace-stories", peaceStoryRoutes);
app.use("/api/incidents", incidentRoute);
app.use("/api/users", allUsers);
app.use("/api/incidents/all", allIncidents);
app.use("/api/incidents/heatmap", heatMapRoute);
app.use("/api/", analyticsRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler (last)
app.use(errorHandler);

// ---- IMPORTANT: HTTP SERVER WRAPPER FOR WEBSOCKETS ----
const server = http.createServer(app);

// Initialize WebSocket
initWebsocket(server);

// ---- CONNECT DB THEN START SERVER ----
mongoose
  .connect(process.env.MONGO_URI, {})
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

// Optional error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: err.message });
// });
