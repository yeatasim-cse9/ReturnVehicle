import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { Ride } from "../models/Ride.js";
import mongoose from "mongoose";

const router = Router();

// helpers
function isISODate(s) {
  const d = new Date(s);
  return !isNaN(d.getTime());
}
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------- PUBLIC SEARCH ----------
// GET /api/rides/search?q params:
// from, to, journeyDate(YYYY-MM-DD), returnDate(optional), category, passengers,
// priceMin, priceMax, sort: date_asc|date_desc|price_asc|price_desc, page, limit
router.get("/search", async (req, res, next) => {
  try {
    const {
      from = "",
      to = "",
      journeyDate = "",
      returnDate = "",
      category = "",
      passengers = "1",
      priceMin = "",
      priceMax = "",
      sort = "date_asc",
    } = req.query;

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit || "10", 10))
    );
    const skip = (page - 1) * limit;

    const filter = { status: "available" };

    if (from.trim())
      filter.from = { $regex: new RegExp(escapeRegex(from.trim()), "i") };
    if (to.trim())
      filter.to = { $regex: new RegExp(escapeRegex(to.trim()), "i") };

    if (journeyDate) {
      if (!isISODate(journeyDate))
        return res.status(400).json({ message: "Invalid journeyDate" });
      const start = new Date(journeyDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.journeyDate = { $gte: start, $lt: end };
    }

    if (returnDate) {
      if (!isISODate(returnDate))
        return res.status(400).json({ message: "Invalid returnDate" });
      const rs = new Date(returnDate);
      const re = new Date(rs);
      re.setDate(re.getDate() + 1);
      filter.returnDate = { $gte: rs, $lt: re };
    }

    if (category && ["Ambulance", "Car", "Truck"].includes(category)) {
      filter.category = category;
    }

    const pax = Math.max(1, parseInt(String(passengers), 10) || 1);
    filter.availableSeats = { $gte: pax };

    const min = priceMin !== "" ? Number(priceMin) : null;
    const max = priceMax !== "" ? Number(priceMax) : null;
    if (min !== null || max !== null) {
      filter.price = {};
      if (min !== null && !isNaN(min) && min >= 0) filter.price.$gte = min;
      if (max !== null && !isNaN(max) && max >= 0) filter.price.$lte = max;
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }

    const sortMap = {
      date_asc: { journeyDate: 1, createdAt: -1 },
      date_desc: { journeyDate: -1, createdAt: -1 },
      price_asc: { price: 1, createdAt: -1 },
      price_desc: { price: -1, createdAt: -1 },
    };
    const sortBy = sortMap[sort] || sortMap.date_asc;

    const [items, total] = await Promise.all([
      Ride.find(filter).sort(sortBy).skip(skip).limit(limit).lean(),
      Ride.countDocuments(filter),
    ]);

    return res.json({
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

// ---------- DRIVER: CREATE ----------
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
    } = req.body || {};

    if (!from || !to)
      return res.status(400).json({ message: "From/To required" });
    if (!journeyDate || !isISODate(journeyDate))
      return res.status(400).json({ message: "Invalid journeyDate" });
    if (returnDate && !isISODate(returnDate))
      return res.status(400).json({ message: "Invalid returnDate" });
    if (!["Ambulance", "Car", "Truck"].includes(category))
      return res.status(400).json({ message: "Invalid category" });
    if (!(price > 0)) return res.status(400).json({ message: "Invalid price" });
    if (!vehicleModel)
      return res.status(400).json({ message: "Vehicle model required" });
    if (!(totalSeats >= 1))
      return res.status(400).json({ message: "Invalid totalSeats" });
    if (!(availableSeats >= 0 && availableSeats <= totalSeats))
      return res.status(400).json({ message: "Invalid availableSeats" });
    if (returnDate && new Date(returnDate) < new Date(journeyDate)) {
      return res
        .status(400)
        .json({ message: "returnDate cannot be earlier than journeyDate" });
    }

    const ride = await Ride.create({
      driverId: req.authUser.uid,
      from: String(from).trim(),
      to: String(to).trim(),
      journeyDate: new Date(journeyDate),
      returnDate: returnDate ? new Date(returnDate) : null,
      category,
      price,
      vehicleModel: String(vehicleModel).trim(),
      totalSeats,
      availableSeats,
      imageUrl: imageUrl || null,
      status: "available",
    });

    return res.status(201).json({ ride });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/rides/mine  (driver only)
 */
router.get(
  "/mine",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit || "10", 10))
      );
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Ride.find({ driverId: req.authUser.uid })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Ride.countDocuments({ driverId: req.authUser.uid }),
      ]);

      return res.json({
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/rides/:id  (driver only, own rides)
 */
router.patch(
  "/:id",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id))
        return res.status(400).json({ message: "Invalid ride id" });

      const ride = await Ride.findById(id);
      if (!ride) return res.status(404).json({ message: "Ride not found" });
      if (ride.driverId !== req.authUser.uid)
        return res.status(403).json({ message: "Forbidden" });

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
        "imageUrl",
        "status",
      ];
      const data = {};
      for (const k of allowed) if (k in req.body) data[k] = req.body[k];

      if ("from" in data && !data.from)
        return res.status(400).json({ message: "From required" });
      if ("to" in data && !data.to)
        return res.status(400).json({ message: "To required" });
      if ("journeyDate" in data && !isISODate(data.journeyDate))
        return res.status(400).json({ message: "Invalid journeyDate" });
      if (
        "returnDate" in data &&
        data.returnDate &&
        !isISODate(data.returnDate)
      )
        return res.status(400).json({ message: "Invalid returnDate" });
      if (
        "category" in data &&
        !["Ambulance", "Car", "Truck"].includes(data.category)
      )
        return res.status(400).json({ message: "Invalid category" });
      if ("price" in data && !(Number(data.price) > 0))
        return res.status(400).json({ message: "Invalid price" });
      if ("vehicleModel" in data && !data.vehicleModel)
        return res.status(400).json({ message: "Vehicle model required" });
      if ("totalSeats" in data && !(Number(data.totalSeats) >= 1))
        return res.status(400).json({ message: "Invalid totalSeats" });
      if ("availableSeats" in data) {
        const total = Number(
          "totalSeats" in data ? data.totalSeats : ride.totalSeats
        );
        const available = Number(data.availableSeats);
        if (!(available >= 0 && available <= total))
          return res.status(400).json({ message: "Invalid availableSeats" });
      }
      if (
        "status" in data &&
        !["available", "unavailable"].includes(data.status)
      )
        return res.status(400).json({ message: "Invalid status" });

      if ("journeyDate" in data) data.journeyDate = new Date(data.journeyDate);
      if ("returnDate" in data)
        data.returnDate = data.returnDate ? new Date(data.returnDate) : null;
      if (
        ("journeyDate" in data || "returnDate" in data) &&
        (data.returnDate || ride.returnDate)
      ) {
        const jd = "journeyDate" in data ? data.journeyDate : ride.journeyDate;
        const rd = "returnDate" in data ? data.returnDate : ride.returnDate;
        if (rd && jd && rd < jd)
          return res
            .status(400)
            .json({ message: "returnDate cannot be earlier than journeyDate" });
      }

      const updated = await Ride.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      ).lean();
      return res.json({ ride: updated });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/rides/:id  (driver only, own rides)
 */
router.delete(
  "/:id",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id))
        return res.status(400).json({ message: "Invalid ride id" });

      const ride = await Ride.findById(id).lean();
      if (!ride) return res.status(404).json({ message: "Ride not found" });
      if (ride.driverId !== req.authUser.uid)
        return res.status(403).json({ message: "Forbidden" });

      await Ride.deleteOne({ _id: id });
      return res.json({ deleted: true });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- PUBLIC: GET ONE (KEEP THIS LAST!) ----------
// GET /api/rides/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid ride id" });
    const ride = await Ride.findById(id).lean();
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    return res.json({ ride });
  } catch (err) {
    next(err);
  }
});

export default router;
