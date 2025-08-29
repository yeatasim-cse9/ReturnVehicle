import express from "express";
import morgan from "morgan";
import cors from "cors";
import { env } from "./config/env.js";
import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import locationsRouter from "./routes/locations.routes.js";
import ridesRouter from "./routes/rides.routes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middlewares
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

// Routes
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/rides", ridesRouter);

// Fallbacks
app.use("*", notFound);
app.use(errorHandler);

export default app;
