import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['conflict', 'violence', 'tension', 'displacement', 'natural disaster', 'other'],
      default: 'other',
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
      required: true,
    },
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebUser', // references the user who verified the incident
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebUser',
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
