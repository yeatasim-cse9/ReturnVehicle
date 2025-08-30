import express from "express";
import morgan from "morgan";
import cors from "cors";
import { env } from "./config/env.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import ridesRoutes from "./routes/rides.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import locationsRoutes from "./routes/locations.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// CORS
const allowed = (env.CORS_ORIGIN &&
  env.CORS_ORIGIN.split(",").map((s) => s.trim())) || ["http://localhost:5173"];

app.use(
  cors({
    origin: allowed,
    credentials: true,
  })
);

// Parsers & logger
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, env: env.NODE_ENV || "development" });
});

// ---- Mount APIs ----
app.use("/api/auth", authRoutes);
app.use("/api/rides", ridesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/admin", adminRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("ERROR:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

export default app;
