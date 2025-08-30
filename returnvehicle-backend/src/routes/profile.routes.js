import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { User } from "../models/User.js";

const router = Router();

// GET /api/profile -> current user's profile
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { uid } = req.authUser || {};
    const user = await User.findOne({ uid }).lean();
    if (!user) return res.status(404).json({ message: "Profile not found" });
    res.json({
      user: {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        role: user.role || "user",
        status: user.status || "approved",
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/profile -> update own profile (displayName, photoURL)
router.patch("/", requireAuth, async (req, res, next) => {
  try {
    const { uid } = req.authUser || {};
    const updates = {};
    if (typeof req.body.displayName === "string")
      updates.displayName = req.body.displayName.trim();
    if (typeof req.body.photoURL === "string")
      updates.photoURL = req.body.photoURL.trim();

    const user = await User.findOneAndUpdate(
      { uid },
      { $set: updates },
      { new: true }
    ).lean();

    if (!user) return res.status(404).json({ message: "Profile not found" });

    res.json({
      user: {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        role: user.role || "user",
        status: user.status || "approved",
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
