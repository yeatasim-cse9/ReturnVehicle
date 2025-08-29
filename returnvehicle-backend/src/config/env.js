import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  // ✅ Support both MONGO_URI and MONGODB_URI
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || "",

  // (যদি দরকার হয় ভবিষ্যতে অন্য keys এখানেই রাখবেন)
};
