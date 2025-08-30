import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    userId: { type: String, required: true }, // Firebase UID of passenger
    driverId: { type: String, required: true }, // Firebase UID of ride owner

    // seats & pricing
    passengers: { type: Number, required: true, min: 1, default: 1 },
    pricePerSeat: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    // contact info (these must be visible to driver)
    contactName: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },

    // booking state
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "canceled", "completed"],
      default: "pending",
      index: true,
    },

    // a short code for user UX
    bookingCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// ensure bookingCode always present to avoid dup null
BookingSchema.pre("save", function (next) {
  if (!this.bookingCode) {
    // 8 char alpha-num
    this.bookingCode = Math.random().toString(36).slice(2, 10).toUpperCase();
  }
  if (this.totalPrice == null) {
    this.totalPrice = (this.pricePerSeat || 0) * (this.passengers || 1);
  }
  next();
});

export const Booking = mongoose.model("Booking", BookingSchema);
