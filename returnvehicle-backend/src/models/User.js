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
    // আগের ডকুমেন্টে status নাও থাকতে পারে; ডিফল্ট = 'approved'
    status: {
      type: String,
      enum: ["approved", "blocked"],
      default: "approved",
      index: true,
    },
  },
  { timestamps: true }
);

// ⚠️ collection নাম 'users' ফিক্স করা হলো যাতে আগের কালেকশনই ব্যবহার হয়
export const User =
  mongoose.models.User || mongoose.model("User", UserSchema, "users");
