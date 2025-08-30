import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { User } from "../models/User.js";

const router = Router();

// GET /api/auth/whoami -> current user (create if not exists)
router.get("/whoami", requireAuth, async (req, res, next) => {
  try {
    const { uid, email, name, picture } = req.authUser || {};
    let user = await User.findOne({ uid }).lean();
    if (!user) {
      const created = await User.create({
        uid,
        email: email || "",
        displayName: name || "",
        photoURL: picture || "",
        role: "user",
      });
      user = created.toObject();
    }
    res.json({
      user: {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        phoneNumber: user.phoneNumber || "", // ফোন নম্বর যোগ করা হয়েছে
        role: user.role || "user",
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/set-role -> set role or update profile
router.post("/set-role", requireAuth, async (req, res, next) => {
  try {
    const { uid } = req.authUser || {};
    const { role, displayName, photoURL, phoneNumber } = req.body || {}; // phoneNumber যোগ করা হয়েছে

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (role != null) {
      const newRole = String(role).toLowerCase();
      const allowed = ["user", "driver", "admin"];
      if (allowed.includes(newRole)) {
        if (!(user.role && user.role !== "user" && user.role !== newRole)) {
          user.role = newRole;
        }
      }
    }

    if (displayName != null) {
      user.displayName = displayName;
    }
    if (photoURL != null) {
      user.photoURL = photoURL;
    }
    if (phoneNumber != null) {
      user.phoneNumber = phoneNumber; // ফোন নম্বর আপডেটের যুক্তি
    }

    await user.save();

    res.json({
      user: {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        phoneNumber: user.phoneNumber || "", // ফোন নম্বর যোগ করা হয়েছে
        role: user.role || "user",
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
