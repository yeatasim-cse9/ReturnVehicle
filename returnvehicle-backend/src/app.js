import express from "express";
import morgan from "morgan";
import cors from "cors";
import { env } from "./config/env.js";

// Middlewares/Models (for inline auth endpoints below)
import { requireAuth } from "./middlewares/auth.js";
import { User } from "./models/User.js";

// Routes (keep using routers as before)
import authRoutes from "./routes/auth.routes.js"; // ok if file exists
import ridesRoutes from "./routes/rides.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import locationsRoutes from "./routes/locations.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";

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

// ---- Mount APIs (existing) ----
app.use("/api/auth", authRoutes); // if auth.routes.js is present
app.use("/api/rides", ridesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/uploads", uploadsRoutes);

// ---- Inline fallback auth endpoints (guarantee NO 404 for whoami/set-role) ----
// GET /api/auth/whoami
app.get("/api/auth/whoami", requireAuth, async (req, res, next) => {
  try {
    const { uid, email, name, picture } = req.authUser || {};
    let user = await User.findOne({ uid }).lean();
    if (!user) {
      const created = await User.create({
        uid,
        email: email || "",
        displayName: name || "",
        photoURL: picture || "",
        role: "user",
      });
      user = created.toObject();
    }
    res.json({
      user: {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        role: user.role || "user",
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/set-role
app.post("/api/auth/set-role", requireAuth, async (req, res, next) => {
  try {
    const { uid, email } = req.authUser || {};
    let { role, displayName, photoURL } = req.body || {};
    role = String(role || "").toLowerCase();
    const allowed = ["user", "driver", "admin"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "invalid role" });
    }

    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({
        uid,
        email: email || "",
        displayName: displayName || "",
        photoURL: photoURL || "",
        role,
      });
    } else {
      // keep existing non-user role if different
      if (user.role && user.role !== "user" && user.role !== role) {
        return res.json({
          user: {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            role: user.role,
          },
        });
      }
      user.role = role;
      if (displayName) user.displayName = displayName;
      if (photoURL) user.photoURL = photoURL;
      await user.save();
    }

    res.json({
      user: {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        role: user.role || "user",
      },
    });
  } catch (err) {
    next(err);
  }
});

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
