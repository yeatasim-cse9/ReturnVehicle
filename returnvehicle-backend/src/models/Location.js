import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true }, // e.g., "Chattogram"
    division: { type: String, required: true, index: true }, // e.g., "Chattogram"
    type: { type: String, default: "district", index: true }, // district | city | upazila (now: district)
    alt: { type: [String], default: [] }, // alternative spellings, e.g., ["Chittagong"]
    normalizedName: { type: String, index: true }, // lowercased for easier regex
  },
  { timestamps: true }
);

// helpful compound text search
LocationSchema.index({ name: "text", alt: "text" });

LocationSchema.pre("save", function (next) {
  this.normalizedName = (this.name || "").toLowerCase();
  next();
});

export const Location =
  mongoose.models.Location || mongoose.model("Location", LocationSchema);
