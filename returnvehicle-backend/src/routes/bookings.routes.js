import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { Ride } from "../models/Ride.js";
import { Booking } from "../models/Booking.js";

const router = Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * POST /api/bookings
 * body: { rideId, seats, fullName, phone, note }
 * role: user
 * - checks seat availability atomically
 * - creates a booking, decrements ride.availableSeats
 */
router.post("/", requireAuth, requireRole("user"), async (req, res, next) => {
  try {
    const { rideId, seats, fullName, phone, note = "" } = req.body || {};
    if (!isValidObjectId(rideId))
      return res.status(400).json({ message: "Invalid rideId" });

    const nSeats = Number(seats);
    if (!(nSeats >= 1))
      return res.status(400).json({ message: "Seats must be >= 1" });
    if (!String(fullName || "").trim())
      return res.status(400).json({ message: "Full name required" });
    if (!String(phone || "").trim())
      return res.status(400).json({ message: "Phone required" });

    const ride = await Ride.findById(rideId).lean();
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "available")
      return res.status(400).json({ message: "Ride is not available" });
    if (ride.driverId === req.authUser.uid) {
      return res.status(400).json({ message: "You cannot book your own ride" });
    }

    // atomic seat decrement
    const updatedRide = await Ride.findOneAndUpdate(
      { _id: rideId, status: "available", availableSeats: { $gte: nSeats } },
      { $inc: { availableSeats: -nSeats } },
      { new: true }
    ).lean();

    if (!updatedRide) {
      return res.status(400).json({ message: "Seat is not Available" });
    }

    const amount = Number(ride.price) * nSeats;

    const booking = await Booking.create({
      rideId,
      userId: req.authUser.uid,
      driverId: ride.driverId,
      seats: nSeats,
      amount,
      passengerName: String(fullName).trim(),
      phone: String(phone).trim(),
      note: String(note || "").trim(),
      status: "booked",
    });

    return res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/bookings/mine
 * role: user
 * query: page, limit
 * - lists current user's bookings with ride snapshot
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

      const [items, total] = await Promise.all([
        Booking.aggregate([
          { $match: { userId: req.authUser.uid } },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "rides",
              localField: "rideId",
              foreignField: "_id",
              as: "ride",
            },
          },
          { $unwind: "$ride" },
          {
            $project: {
              _id: 1,
              status: 1,
              seats: 1,
              amount: 1,
              passengerName: 1,
              phone: 1,
              note: 1,
              createdAt: 1,
              "ride._id": 1,
              "ride.from": 1,
              "ride.to": 1,
              "ride.journeyDate": 1,
              "ride.returnDate": 1,
              "ride.price": 1,
              "ride.category": 1,
              "ride.vehicleModel": 1,
              "ride.availableSeats": 1,
              "ride.totalSeats": 1,
            },
          },
        ]),
        Booking.countDocuments({ userId: req.authUser.uid }),
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
 * GET /api/bookings/driver
 * role: driver
 * - lists bookings on rides that belong to this driver
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

      const [items, total] = await Promise.all([
        Booking.aggregate([
          { $match: { driverId: req.authUser.uid } },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "rides",
              localField: "rideId",
              foreignField: "_id",
              as: "ride",
            },
          },
          { $unwind: "$ride" },
          {
            $project: {
              _id: 1,
              status: 1,
              seats: 1,
              amount: 1,
              passengerName: 1,
              phone: 1,
              note: 1,
              createdAt: 1,
              "ride._id": 1,
              "ride.from": 1,
              "ride.to": 1,
              "ride.journeyDate": 1,
              "ride.returnDate": 1,
              "ride.price": 1,
              "ride.category": 1,
              "ride.vehicleModel": 1,
            },
          },
        ]),
        Booking.countDocuments({ driverId: req.authUser.uid }),
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
 * PATCH /api/bookings/:id/cancel
 * role: user (own booking)
 * - set status=cancelled (only if status=booked and journeyDate in future)
 * - increments ride.availableSeats back
 */
router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole("user"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id))
        return res.status(400).json({ message: "Invalid booking id" });

      const booking = await Booking.findById(id);
      if (!booking)
        return res.status(404).json({ message: "Booking not found" });
      if (booking.userId !== req.authUser.uid)
        return res.status(403).json({ message: "Forbidden" });
      if (booking.status !== "booked")
        return res
          .status(400)
          .json({ message: "Booking already cancelled/completed" });

      const ride = await Ride.findById(booking.rideId).lean();
      if (!ride) return res.status(404).json({ message: "Ride not found" });

      // only allow cancel if journey is in the future
      const now = new Date();
      if (ride.journeyDate && new Date(ride.journeyDate) <= now) {
        return res
          .status(400)
          .json({ message: "Cannot cancel on/after journey date" });
      }

      // 1) set booking cancelled
      booking.status = "cancelled";
      await booking.save();

      // 2) give seats back
      await Ride.updateOne(
        { _id: booking.rideId },
        { $inc: { availableSeats: booking.seats } }
      );

      return res.json({ booking });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
