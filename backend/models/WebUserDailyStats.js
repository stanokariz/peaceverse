import mongoose from "mongoose";

const dailyStatsSchema = new mongoose.Schema({
  email: String,
  phoneNumber: String,
  role: String,
  createdAt: Date,
  deletedAt: Date,
});

export default mongoose.models.WebUserDailyStats || mongoose.model("WebUserDailyStats", dailyStatsSchema);
