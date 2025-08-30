// returnvehicle-backend/src/routes/admin.routes.js
import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { User } from "../models/User.js";

const router = Router();

// সব admin রুটের আগে auth + admin guard
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/users?query=&role=&status=&page=1&limit=10
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
    // টেক্সট সার্চ: email + displayName
    if (query && String(query).trim()) {
      const rx = new RegExp(String(query).trim(), "i");
      q.$or = [{ email: rx }, { displayName: rx }];
    }
    // রোল ফিল্টার
    if (role && String(role).trim()) {
      q.role = String(role).trim();
    }
    // স্ট্যাটাস ফিল্টার থাকলে কেবল অ্যাপ্লাই (আপনার স্কিমায় status না থাকলে বাদ যাবে)
    if (status && String(status).trim()) {
      q.status = String(status).trim();
    }

    const [items, total] = await Promise.all([
      User.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("uid email displayName role phone photoURL createdAt status") // নিরাপদ ফিল্ডগুলোই পাঠাই
        .lean(),
      User.countDocuments(q),
    ]);

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
