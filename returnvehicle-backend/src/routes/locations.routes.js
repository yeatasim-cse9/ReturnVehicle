import { Router } from "express";
import { Location } from "../models/Location.js";

const router = Router();

function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * GET /api/locations/search?q=dh&limit=10
 * - Prefix match priority; fallback to substring
 * - Returns: [{ id, name, division, type }]
 */
router.get("/search", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 20);

    if (!q) return res.json({ items: [] });

    const prefix = new RegExp("^" + escapeRegex(q), "i");
    const substr = new RegExp(escapeRegex(q), "i");

    let items = await Location.find(
      { $or: [{ name: prefix }, { alt: prefix }] },
      { name: 1, division: 1, type: 1 }
    )
      .sort({ name: 1 })
      .limit(limit)
      .lean();

    if (items.length === 0) {
      items = await Location.find(
        { $or: [{ name: substr }, { alt: substr }] },
        { name: 1, division: 1, type: 1 }
      )
        .sort({ name: 1 })
        .limit(limit)
        .lean();
    }

    return res.json({
      items: items.map((d) => ({
        id: d._id,
        name: d.name,
        division: d.division,
        type: d.type,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
