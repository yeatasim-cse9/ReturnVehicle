import { Router } from "express";
import mongoose from "mongoose";
import { Ride } from "../models/Ride.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
function escRx(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------- Create ride (Driver only) ----------
// POST /api/rides
router.post("/", requireAuth, requireRole("driver"), async (req, res, next) => {
  try {
    const {
      from,
      to,
      journeyDate,
      returnDate,
      category,
      price,
      vehicleModel,
      totalSeats,
      availableSeats,
      imageUrl,
      imageFileId,
    } = req.body || {};

    if (!from?.trim() || !to?.trim())
      return res.status(400).json({ message: "from/to required" });
    if (!journeyDate)
      return res.status(400).json({ message: "journeyDate required" });
    if (!["Ambulance", "Car", "Truck"].includes(category))
      return res.status(400).json({ message: "invalid category" });
    if (!price || Number(price) <= 0)
      return res.status(400).json({ message: "invalid price" });

    if (returnDate) {
      const jd = new Date(journeyDate);
      const rd = new Date(returnDate);
      if (rd < jd)
        return res
          .status(400)
          .json({ message: "returnDate cannot be before journeyDate" });
    }

    const ride = await Ride.create({
      driverId: req.authUser.uid,
      from: from.trim(),
      to: to.trim(),
      journeyDate: new Date(journeyDate),
      returnDate: returnDate ? new Date(returnDate) : null,
      category,
      price: Number(price),
      vehicleModel: (vehicleModel || "").trim(),
      totalSeats: Number(totalSeats || 4),
      availableSeats: Number(availableSeats || 4),

      // ✅ persist image fields
      imageUrl: imageUrl || "",
      imageFileId: imageFileId || "",

      status: "available",
    });

    return res.status(201).json({ ride });
  } catch (err) {
    next(err);
  }
});

// ---------- My rides (Driver only) with pagination ----------
// GET /api/rides/mine?page=&limit=
router.get(
  "/mine",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit || "12", 10))
      );
      const skip = (page - 1) * limit;

      const filter = { driverId: req.authUser.uid };

      const [items, total] = await Promise.all([
        Ride.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Ride.countDocuments(filter),
      ]);

      return res.json({
        items,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- Public: get ride by id ----------
// GET /api/rides/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "invalid id" });
    const ride = await Ride.findById(id).lean();
    if (!ride) return res.status(404).json({ message: "ride not found" });
    return res.json({ ride });
  } catch (err) {
    next(err);
  }
});

// ---------- Driver: update own ride ----------
// PATCH /api/rides/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id))
        return res.status(400).json({ message: "invalid id" });

      const ride = await Ride.findById(id).lean();
      if (!ride) return res.status(404).json({ message: "ride not found" });
      if (ride.driverId !== req.authUser.uid)
        return res.status(403).json({ message: "forbidden" });

      const allowed = [
        "from",
        "to",
        "journeyDate",
        "returnDate",
        "category",
        "price",
        "vehicleModel",
        "totalSeats",
        "availableSeats",
        "status",
        "imageUrl",
        "imageFileId",
      ];
      const set = {};
      for (const k of allowed) {
        if (k in req.body) {
          set[k] = req.body[k];
        }
      }
      if ("journeyDate" in set && set.journeyDate)
        set.journeyDate = new Date(set.journeyDate);
      if ("returnDate" in set)
        set.returnDate = set.returnDate ? new Date(set.returnDate) : null;

      const updated = await Ride.findByIdAndUpdate(
        id,
        { $set: set },
        { new: true }
      ).lean();
      return res.json({ ride: updated });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- Driver: delete own ride ----------
// DELETE /api/rides/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id))
        return res.status(400).json({ message: "invalid id" });

      const ride = await Ride.findById(id).lean();
      if (!ride) return res.status(404).json({ message: "ride not found" });
      if (ride.driverId !== req.authUser.uid)
        return res.status(403).json({ message: "forbidden" });

      await Ride.deleteOne({ _id: id });
      return res.json({ deleted: true });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- Public search ----------
// GET /api/rides/search?from=&to=&date=&category=&minPrice=&maxPrice=&page=&limit=
router.get(
  "/",
  async (req, res, next) => next() // placeholder to avoid route shadow, actual search below
);

router.get("/", async (req, res, next) => {
  try {
    const {
      from = "",
      to = "",
      date = "",
      category = "",
      minPrice = "",
      maxPrice = "",
      page = "1",
      limit = "12",
    } = req.query;

    const q = {};
    if (from.trim()) q.from = { $regex: new RegExp(escRx(from.trim()), "i") };
    if (to.trim()) q.to = { $regex: new RegExp(escRx(to.trim()), "i") };
    if (category && ["Ambulance", "Car", "Truck"].includes(category))
      q.category = category;
    if (date) {
      const d0 = new Date(date);
      const d1 = new Date(date);
      d1.setDate(d1.getDate() + 1);
      q.journeyDate = { $gte: d0, $lt: d1 };
    }
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (!Number.isNaN(min) || !Number.isNaN(max)) {
      q.price = {};
      if (!Number.isNaN(min)) q.price.$gte = min;
      if (!Number.isNaN(max)) q.price.$lte = max;
    }

    const p = Math.max(1, parseInt(page, 10));
    const l = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      Ride.find(q).sort({ journeyDate: 1 }).skip(skip).limit(l).lean(),
      Ride.countDocuments(q),
    ]);

    res.json({ items, total, page: p, pages: Math.ceil(total / l), limit: l });
  } catch (err) {
    next(err);
  }
});

export default router;
