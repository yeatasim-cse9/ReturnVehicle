import express from "express";
import morgan from "morgan";
import cors from "cors";
import { env } from "./config/env.js";
import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import locationsRouter from "./routes/locations.routes.js";
import ridesRouter from "./routes/rides.routes.js";
import bookingsRouter from "./routes/bookings.routes.js";
import adminRouter from "./routes/admin.routes.js";
import uploadsRouter from "./routes/uploads.routes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// ---------- CORS (multi-origin via comma-separated CLIENT_URL) ----------
const allowed = (env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowed.length === 0 || allowed.includes(origin))
        return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

// ---------- Common Middlewares ----------
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

// ---------- Routes ----------
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/rides", ridesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/uploads", uploadsRouter); // ✅ ImageKit uploads

// ---------- Fallbacks ----------
app.use("*", notFound);
app.use(errorHandler);

export default app;
