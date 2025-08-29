import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { User } from "../models/User.js";

const router = Router();

// GET /api/auth/whoami  -> returns { uid, email, displayName, photoURL, role }
router.get("/whoami", requireAuth, async (req, res) => {
  return res.json({ user: req.authUser });
});

/**
 * POST /api/auth/set-role
 * body: { role: 'user' | 'driver' }
 * requires: Firebase ID token (Authorization: Bearer <token>)
 * effect: updates the current user's role
 */
router.post("/set-role", requireAuth, async (req, res, next) => {
  try {
    const { role } = req.body || {};
    const allowed = ["user", "driver"]; // Admin assign হবে অ্যাডমিন প্যানেল থেকে
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const uid = req.authUser.uid;
    const updated = await User.findOneAndUpdate(
      { uid },
      { $set: { role } },
      { new: true }
    ).lean();

    return res.json({
      message: "Role updated",
      user: {
        uid: updated.uid,
        email: updated.email,
        displayName: updated.displayName,
        photoURL: updated.photoURL,
        role: updated.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
