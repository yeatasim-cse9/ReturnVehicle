import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, default: "" },
    displayName: { type: String, default: "" },
    photoURL: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "driver", "admin"],
      default: "user",
      index: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
