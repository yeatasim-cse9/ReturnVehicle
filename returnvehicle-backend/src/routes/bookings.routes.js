import { Router } from "express";
import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { Ride } from "../models/Ride.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

/**
 * GET /api/bookings/mine
 * User-এর নিজের বুকিংস (ride summary সহ)
 */
router.get(
  "/mine",
  requireAuth,
  requireRole("user"),
  async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit || "10", 10))
      );
      const skip = (page - 1) * limit;

      const q = { userId: req.authUser.uid };

      const [itemsRaw, total] = await Promise.all([
        Booking.find(q)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
            path: "rideId",
            select: "from to journeyDate returnDate category price",
          })
          .lean(),
        Booking.countDocuments(q),
      ]);

      const items = itemsRaw.map((b) => {
        const ride = b.rideId || null;
        delete b.rideId;
        return { ...b, ride };
      });

      res.json({ items, total, page, pages: Math.ceil(total / limit), limit });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/bookings/driver
 * Driver হিসেবে আমার rides-এ হওয়া সব বুকিংস (Passenger + Phone সহ)
 */
router.get(
  "/driver",
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

      const q = { driverId: req.authUser.uid };

      const [itemsRaw, total] = await Promise.all([
        Booking.find(q)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select("+contactName +contactPhone")
          .populate({
            path: "rideId",
            select: "from to journeyDate returnDate category price",
          })
          .lean(),
        Booking.countDocuments(q),
      ]);

      const items = itemsRaw.map((b) => {
        const ride = b.rideId || null;
        delete b.rideId;
        return { ...b, ride };
      });

      res.json({ items, total, page, pages: Math.ceil(total / limit), limit });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/bookings/:id/accept
 * Driver বুকিং Accept করবে → status=confirmed
 * - যদি pending থাকে: seats ডিডাক্ট
 * - যদি already confirmed: no-op (idempotent)
 * - rejected/canceled/completed হলে accept ব্লক
 */
router.patch(
  "/:id/accept",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid id" });
    }

    const session = await mongoose.startSession();
    try {
      let result = null;
      await session.withTransaction(async () => {
        const b = await Booking.findById(id).session(session);
        if (!b) {
          const e = new Error("booking not found");
          e.status = 404;
          throw e;
        }

        // ensure ownership
        if (b.driverId !== req.authUser.uid) {
          const e = new Error("forbidden");
          e.status = 403;
          throw e;
        }

        // already confirmed → return as is
        if (b.status === "confirmed") {
          result = b;
          return;
        }

        // invalid states
        if (["canceled", "completed"].includes(b.status)) {
          const e = new Error(`cannot accept a ${b.status} booking`);
          e.status = 400;
          throw e;
        }

        // must have ride
        const ride = await Ride.findById(b.rideId).session(session);
        if (!ride) {
          const e = new Error("ride not found");
          e.status = 404;
          throw e;
        }

        // check seats if from pending/rejected
        const need = b.passengers || 1;
        if (ride.availableSeats < need) {
          const e = new Error("Seat is not Available");
          e.status = 409;
          throw e;
        }

        // deduct seats & confirm
        ride.availableSeats -= need;
        await ride.save({ session });

        b.status = "confirmed";
        result = await b.save({ session });
      });
      session.endSession();

      // hydrate summary
      const hydrated = await Booking.findById(result._id)
        .populate({
          path: "rideId",
          select: "from to journeyDate returnDate category price",
        })
        .lean();
      const ride = hydrated?.rideId || null;
      if (hydrated) delete hydrated.rideId;
      res.json({ ...(hydrated || {}), ride });
    } catch (err) {
      session.endSession();
      if (err?.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    }
  }
);

/**
 * PATCH /api/bookings/:id/reject
 * Driver বুকিং Reject করবে → status=rejected
 * - যদি confirmed থাকে: seats ফেরত
 * - pending হলে: শুধু status=rejected
 */
router.patch(
  "/:id/reject",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid id" });
    }

    const session = await mongoose.startSession();
    try {
      let result = null;
      await session.withTransaction(async () => {
        const b = await Booking.findById(id).session(session);
        if (!b) {
          const e = new Error("booking not found");
          e.status = 404;
          throw e;
        }

        if (b.driverId !== req.authUser.uid) {
          const e = new Error("forbidden");
          e.status = 403;
          throw e;
        }

        if (["canceled", "completed"].includes(b.status)) {
          const e = new Error(`cannot reject a ${b.status} booking`);
          e.status = 400;
          throw e;
        }

        // if confirmed → return seats
        if (b.status === "confirmed") {
          const ride = await Ride.findById(b.rideId).session(session);
          if (ride) {
            ride.availableSeats += b.passengers || 1;
            await ride.save({ session });
          }
        }

        b.status = "rejected";
        result = await b.save({ session });
      });
      session.endSession();

      const hydrated = await Booking.findById(result._id)
        .populate({
          path: "rideId",
          select: "from to journeyDate returnDate category price",
        })
        .lean();
      const ride = hydrated?.rideId || null;
      if (hydrated) delete hydrated.rideId;
      res.json({ ...(hydrated || {}), ride });
    } catch (err) {
      session.endSession();
      if (err?.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    }
  }
);

/**
 * PATCH /api/bookings/:id/cancel
 * User নিজের বুকিং ক্যানসেল করলে seat ফেরত যাবে (confirmed হলে)
 */
router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole("user"),
  async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid id" });
    }

    const session = await mongoose.startSession();
    try {
      let updated = null;
      await session.withTransaction(async () => {
        const b = await Booking.findOne({
          _id: id,
          userId: req.authUser.uid,
        }).session(session);
        if (!b) {
          const e = new Error("booking not found");
          e.status = 404;
          throw e;
        }
        if (b.status !== "confirmed") {
          updated = b;
          return;
        }

        await Ride.updateOne(
          { _id: b.rideId },
          { $inc: { availableSeats: b.passengers } }
        ).session(session);

        b.status = "canceled";
        updated = await b.save({ session });
      });
      session.endSession();

      const hydrated = await Booking.findById(updated._id)
        .populate({
          path: "rideId",
          select: "from to journeyDate returnDate category price",
        })
        .lean();

      const ride = hydrated?.rideId || null;
      if (hydrated) delete hydrated.rideId;
      res.json({ ...(hydrated || {}), ride });
    } catch (err) {
      session.endSession();
      if (err?.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    }
  }
);

export default router;
