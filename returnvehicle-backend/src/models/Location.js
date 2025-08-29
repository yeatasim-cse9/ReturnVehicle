import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

// টেক্সট ইনডেক্স, দ্রুত সার্চের জন্য
LocationSchema.index({ name: "text" });

export const Location =
  mongoose.models.Location ||
  mongoose.model("Location", LocationSchema, "locations");
