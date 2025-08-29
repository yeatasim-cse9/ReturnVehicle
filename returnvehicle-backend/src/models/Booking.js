import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true }, // Firebase uid of passenger
    driverId: { type: String, required: true, index: true }, // ride owner uid

    seats: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 }, // seats * ride.price (snapshot)

    passengerName: { type: String, required: true },
    phone: { type: String, required: true },
    note: { type: String, default: "" },

    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
      index: true,
    },
  },
  { timestamps: true }
);

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
