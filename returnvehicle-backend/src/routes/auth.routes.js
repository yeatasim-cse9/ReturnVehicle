import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { User } from "../models/User.js";

const router = Router();

// GET /api/auth/whoami  -> current user (create if not exists)
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
        role: user.role || "user",
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/set-role  -> set or upsert role after Google/email sign-up
// body: { role: 'user'|'driver'|'admin', displayName?, photoURL? }
router.post("/set-role", requireAuth, async (req, res, next) => {
  try {
    const { uid, email } = req.authUser || {};
    let { role, displayName, photoURL } = req.body || {};
    role = String(role || "").toLowerCase();

    const allowed = ["user", "driver", "admin"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "invalid role" });
    }

    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({
        uid,
        email: email || "",
        displayName: displayName || "",
        photoURL: photoURL || "",
        role,
      });
    } else {
      // যদি আগে থেকেই অন্য role থাকে, সেটা রেখে দিচ্ছি (overwrite নয়)
      if (user.role && user.role !== "user" && user.role !== role) {
        return res.json({
          user: {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            role: user.role,
          },
        });
      }
      user.role = role;
      if (displayName) user.displayName = displayName;
      if (photoURL) user.photoURL = photoURL;
      await user.save();
    }

    res.json({
      user: {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        role: user.role || "user",
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
