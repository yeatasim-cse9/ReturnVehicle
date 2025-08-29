import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "ReturnVehicle API",
    uptime: process.uptime().toFixed(0) + "s",
    timestamp: new Date().toISOString(),
  });
});

export default router;
