import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDB() {
  const uri = env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI (or MONGODB_URI) missing in .env");
  }
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🛑 MongoDB disconnected");
}
