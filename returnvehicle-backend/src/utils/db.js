import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDB() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI missing in .env");
  }
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.DB_NAME,
  });
  console.log("✅ MongoDB connected:", env.DB_NAME);
  return mongoose.connection;
}
