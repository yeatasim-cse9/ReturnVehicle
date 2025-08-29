import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { User } from "../models/User.js";
import { Ride } from "../models/Ride.js";

const router = Router();

function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---------- Admin: Users List ----------
// GET /api/admin/users?query=&role=&status=&page=&limit=
router.get(
  "/users",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit || "10", 10))
      );
      const skip = (page - 1) * limit;

      const { query = "", role = "", status = "" } = req.query;
      const filter = {};

      if (query.trim()) {
        const rx = new RegExp(escapeRegex(query.trim()), "i");
        filter.$or = [{ email: rx }, { displayName: rx }, { uid: rx }];
      }
      if (role && ["user", "driver", "admin"].includes(role)) {
        filter.role = role;
      }
      if (status && ["approved", "blocked"].includes(status)) {
        filter.status = status;
      }

      const [items, total] = await Promise.all([
        User.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(filter),
      ]);

      // পুরোনো ডকে status না থাকলে 'approved' রিটার্ন করি
      const norm = items.map((u) => ({ ...u, status: u.status || "approved" }));

      return res.json({
        items: norm,
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

// ---------- Admin: Update a user (role/status) ----------
// PATCH /api/admin/users/:uid  { role?, status? }
router.patch(
  "/users/:uid",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const { uid } = req.params;
      const { role, status } = req.body || {};

      if (!uid) return res.status(400).json({ message: "uid required" });
      if (role && !["user", "driver", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (status && !["approved", "blocked"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      if (!role && !status) {
        return res.status(400).json({ message: "Nothing to update" });
      }
      // নিজের অ্যাকাউন্ট ব্লক করা যাবে না
      if (status === "blocked" && uid === req.authUser.uid) {
        return res
          .status(400)
          .json({ message: "You cannot block your own account" });
      }

      const set = {};
      if (role) set.role = role;
      if (status) set.status = status;

      const updated = await User.findOneAndUpdate(
        { uid },
        { $set: set },
        { new: true }
      ).lean();
      if (!updated) return res.status(404).json({ message: "User not found" });

      return res.json({
        user: { ...updated, status: updated.status || "approved" },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- Admin: Rides List ----------
// GET /api/admin/rides?query=&status=&category=&page=&limit=
router.get(
  "/rides",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit || "10", 10))
      );
      const skip = (page - 1) * limit;

      const { query = "", status = "", category = "" } = req.query;
      const filter = {};

      if (query.trim()) {
        const rx = new RegExp(escapeRegex(query.trim()), "i");
        filter.$or = [{ from: rx }, { to: rx }, { vehicleModel: rx }];
      }
      if (status && ["available", "unavailable"].includes(status)) {
        filter.status = status;
      }
      if (category && ["Ambulance", "Car", "Truck"].includes(category)) {
        filter.category = category;
      }

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
        limit,
        pages: Math.ceil(total / limit),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- Admin: Delete Ride ----------
// DELETE /api/admin/rides/:id
router.delete(
  "/rides/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id))
        return res.status(400).json({ message: "Invalid ride id" });

      const found = await Ride.findById(id).lean();
      if (!found) return res.status(404).json({ message: "Ride not found" });

      await Ride.deleteOne({ _id: id });
      return res.json({ deleted: true });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
