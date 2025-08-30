// returnvehicle-backend/src/routes/admin.routes.js
import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { User } from "../models/User.js";
import { Ride } from "../models/Ride.js"; // Ride মডেল ইম্পোর্ট করা হয়েছে

const router = Router();

// সব admin রুটের আগে auth + admin guard
router.use(requireAuth, requireRole("admin"));

// ------------------ USER MANAGEMENT ------------------

// GET /api/admin/users (আগের মতোই)
router.get("/users", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit || "10", 10))
    );
    const skip = (page - 1) * limit;
    const { query = "", role = "", status = "" } = req.query;

    const q = {};
    if (query && String(query).trim()) {
      const rx = new RegExp(String(query).trim(), "i");
      q.$or = [{ email: rx }, { displayName: rx }];
    }
    if (role) q.role = String(role).trim();
    if (status) q.status = String(status).trim();

    const [items, total] = await Promise.all([
      User.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "uid email displayName role phoneNumber photoURL createdAt status"
        )
        .lean(),
      User.countDocuments(q),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit), limit });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:uid (নতুন রুট)
// ব্যবহারকারীর role এবং status আপডেট করার জন্য
router.patch("/users/:uid", async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { role, status } = req.body;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role && ["user", "driver", "admin"].includes(role)) {
      user.role = role;
    }
    if (status && ["approved", "blocked"].includes(status)) {
      user.status = status;
    }

    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// ------------------ RIDE MANAGEMENT ------------------

// GET /api/admin/rides (নতুন রুট)
// সব রাইড তালিকা আকারে দেখার জন্য
router.get("/rides", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit || "10", 10))
    );
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Ride.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Ride.countDocuments({}),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit), limit });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/rides/:id (নতুন রুট)
// নির্দিষ্ট রাইড ডিলেট করার জন্য
router.delete("/rides/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const ride = await Ride.findByIdAndDelete(id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    res.json({ deleted: true, id });
  } catch (err) {
    next(err);
  }
});

export default router;
