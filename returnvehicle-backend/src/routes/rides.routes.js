import { Router } from "express";
import mongoose from "mongoose";
import { Ride } from "../models/Ride.js";
import { Booking } from "../models/Booking.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

// Helpers
function parseBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v !== "string") return false;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

// ------------------------------
// GET /api/rides  (public search)
// ------------------------------
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit || "12", 10))
    );
    const skip = (page - 1) * limit;

    const { from, to, date, category, priceMin, priceMax, onlyAvailable } =
      req.query;

    const q = {};

    if (from) q.from = { $regex: new RegExp(from, "i") };
    if (to) q.to = { $regex: new RegExp(to, "i") };
    if (category) q.category = { $regex: new RegExp(category, "i") };

    if (date) {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      q.journeyDate = { $gte: start, $lt: end };
    }

    // price
    const min = Number(priceMin || 0);
    const max = Number(priceMax || 0);
    if (min || max) {
      q.price = {};
      if (min) q.price.$gte = min;
      if (max) q.price.$lte = max;
    }

    if (parseBool(onlyAvailable)) {
      q.status = "available";
      q.availableSeats = { $gt: 0 };
    }

    const [items, total] = await Promise.all([
      Ride.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Ride.countDocuments(q),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit), limit });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------
// GET /api/rides/mine (driver's own rides)
// ---------------------------------------
router.get(
  "/mine",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit || "20", 10))
      );
      const skip = (page - 1) * limit;
      const q = { driverId: req.authUser.uid };

      const [items, total] = await Promise.all([
        Ride.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Ride.countDocuments(q),
      ]);

      res.json({ items, total, page, pages: Math.ceil(total / limit), limit });
    } catch (err) {
      next(err);
    }
  }
);

// -------------------------------
// POST /api/rides (create a ride)
// -------------------------------
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
      status,
    } = req.body;

    if (
      !from ||
      !to ||
      !journeyDate ||
      !category ||
      !price ||
      !vehicleModel ||
      !totalSeats
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ride = await Ride.create({
      driverId: req.authUser.uid,
      from: String(from).trim(),
      to: String(to).trim(),
      journeyDate: new Date(journeyDate),
      returnDate: returnDate ? new Date(returnDate) : null,
      category,
      price: Number(price),
      vehicleModel: String(vehicleModel).trim(),
      totalSeats: Number(totalSeats),
      availableSeats: Number(availableSeats ?? totalSeats),
      imageUrl: imageUrl || "",
      imageFileId: imageFileId || "",
      status: status || "available",
    });

    res.status(201).json(ride);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------
// PATCH /api/rides/:id (update a ride)
// ---------------------------------------
router.patch(
  "/:id",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "invalid id" });
      }

      const ride = await Ride.findOne({ _id: id, driverId: req.authUser.uid });
      if (!ride) return res.status(404).json({ message: "ride not found" });

      const allowed = [
        "price",
        "vehicleModel",
        "totalSeats",
        "availableSeats",
        "status",
        "imageUrl",
        "imageFileId",
      ];

      for (const key of allowed) {
        if (req.body[key] !== undefined) {
          if (["price", "totalSeats", "availableSeats"].includes(key)) {
            ride[key] = Number(req.body[key]);
          } else {
            ride[key] = req.body[key];
          }
        }
      }

      await ride.save();
      res.json(ride);
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------
// DELETE /api/rides/:id (delete a ride)
// ---------------------------------------
router.delete(
  "/:id",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "invalid id" });
      }
      const ride = await Ride.findOneAndDelete({
        _id: id,
        driverId: req.authUser.uid,
      });
      if (!ride) return res.status(404).json({ message: "ride not found" });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// ------------------------------------------------------
// POST /api/rides/:id/book  (user creates a booking)
// ------------------------------------------------------
router.post(
  "/:id/book",
  requireAuth,
  requireRole("user"),
  async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid ride id" });
    }

    const session = await mongoose.startSession();
    try {
      let created = null;

      await session.withTransaction(async () => {
        const ride = await Ride.findById(id).session(session);
        if (!ride) {
          const e = new Error("ride not found");
          e.status = 404;
          throw e;
        }
        if (ride.status !== "available") {
          const e = new Error("ride unavailable");
          e.status = 409;
          throw e;
        }

        const passengers = Math.max(1, Number(req.body.passengers || 1));

        if ((ride.availableSeats || 0) < passengers) {
          const e = new Error("Seat is not Available");
          e.status = 409;
          throw e;
        }

        const contactName = (
          req.body.contactName ||
          req.body.passengerName ||
          req.body.name ||
          ""
        )
          .toString()
          .trim();
        const contactPhone = (req.body.contactPhone || req.body.phone || "")
          .toString()
          .trim();

        const pricePerSeat = Number(ride.price || 0);

        created = await Booking.create(
          [
            {
              rideId: ride._id,
              userId: req.authUser.uid,
              driverId: ride.driverId,
              passengers,
              pricePerSeat,
              totalPrice: pricePerSeat * passengers,
              contactName,
              contactPhone,
              status: "pending",
            },
          ],
          { session }
        );

        created = created[0];
      });

      session.endSession();

      const hydrated = await Booking.findById(created._id)
        .populate({
          path: "rideId",
          select: "from to journeyDate returnDate category price",
        })
        .lean();
      const ride = hydrated?.rideId || null;
      if (hydrated) delete hydrated.rideId;

      res.status(201).json({ ...(hydrated || {}), ride });
    } catch (err) {
      session.endSession();
      if (err?.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    }
  }
);

// ---------------------------------------
// DEBUG: filter inspector  (keep BEFORE :id)
// ---------------------------------------
router.get("/_debug/filters", async (req, res, next) => {
  try {
    const { from, to, date, category, priceMin, priceMax } = req.query;
    const q = {};
    if (from) q.from = { $regex: new RegExp(from, "i") };
    if (to) q.to = { $regex: new RegExp(to, "i") };
    if (category) q.category = { $regex: new RegExp(category, "i") };
    if (date) {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      q.journeyDate = { $gte: start, $lt: end };
    }
    const min = Number(priceMin || 0);
    const max = Number(priceMax || 0);
    if (min || max) {
      q.price = {};
      if (min) q.price.$gte = min;
      if (max) q.price.$lte = max;
    }
    const totalAll = await Ride.countDocuments({});
    const sample = await Ride.find(q).limit(1).lean();
    const matchCount = await Ride.countDocuments(q);
    res.json({
      ok: true,
      totalAll,
      matchCount,
      queryParams: { from, to, date, category },
      builtFilter: q,
      sample,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------
// GET /api/rides/:id (public getById)
//   NOTE: placed AFTER /_debug/filters to avoid route conflict
// ---------------------------------------
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid id" });
    }
    const ride = await Ride.findById(id).lean();
    if (!ride) return res.status(404).json({ message: "ride not found" });
    res.json(ride);
  } catch (err) {
    next(err);
  }
});

export default router;
