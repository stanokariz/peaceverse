import mongoose from "mongoose";

const peaceStorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "WebUser", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  city: {
      type: String,
      required: [true, "City is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    lat: {
      type: Number,
      required: [true, "Latitude is required"],
    },
    lng: {
      type: Number,
      required: [true, "Longitude is required"],
    },
}, { timestamps: true });

export default mongoose.model("PeaceStory", peaceStorySchema);
