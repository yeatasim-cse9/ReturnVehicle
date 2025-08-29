import mongoose from "mongoose";

const RideSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, index: true }, // Firebase uid
    from: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    journeyDate: { type: Date, required: true, index: true },
    returnDate: { type: Date, default: null, index: true },
    category: {
      type: String,
      enum: ["Ambulance", "Car", "Truck"],
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 1 },
    vehicleModel: { type: String, required: true },
    totalSeats: { type: Number, required: true, min: 1, max: 50 },
    availableSeats: { type: Number, required: true, min: 0, max: 50 },
    imageUrl: { type: String, default: null }, // optional, ImageKit later
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
      index: true,
    },
  },
  { timestamps: true }
);

RideSchema.index({ from: 1, to: 1, journeyDate: 1 });

export const Ride = mongoose.models.Ride || mongoose.model("Ride", RideSchema);
