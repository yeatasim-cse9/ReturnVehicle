import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,

  // Multi-origin (comma separated)
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  // Mongo URI (support both names)
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || "",

  // ImageKit
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY || "",
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || "",
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || "",
};
