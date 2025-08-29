import mongoose from "mongoose";

const RideSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, index: true }, // Firebase UID
    from: { type: String, required: true, trim: true, index: true },
    to: { type: String, required: true, trim: true, index: true },
    journeyDate: { type: Date, required: true, index: true },
    returnDate: { type: Date, default: null },
    category: {
      type: String,
      enum: ["Ambulance", "Car", "Truck"],
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 1 },
    vehicleModel: { type: String, default: "" },
    totalSeats: { type: Number, default: 4, min: 1 },
    availableSeats: { type: Number, default: 4, min: 0 },

    // ✅ Image fields
    imageUrl: { type: String, default: "" },
    imageFileId: { type: String, default: "" }, // optional (for delete)

    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
      index: true,
    },
  },
  { timestamps: true }
);

RideSchema.index({ from: 1, to: 1, journeyDate: -1 });

export const Ride =
  mongoose.models.Ride || mongoose.model("Ride", RideSchema, "rides");
