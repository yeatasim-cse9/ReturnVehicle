import { Router } from "express";
import { Location } from "../models/Location.js";

const router = Router();

// ৬৪ জেলা + বড় শহরগুলোর নাম, fallback হিসেবে
const BD_LOCATIONS = [
  // Dhaka division
  "Dhaka",
  "Faridpur",
  "Gazipur",
  "Gopalganj",
  "Kishoreganj",
  "Manikganj",
  "Munshiganj",
  "Narayanganj",
  "Narsingdi",
  "Rajbari",
  "Shariatpur",
  "Tangail",
  // Chattogram division
  "Chattogram",
  "Bandarban",
  "Brahmanbaria",
  "Chandpur",
  "Cumilla",
  "Cox's Bazar",
  "Feni",
  "Khagrachhari",
  "Lakshmipur",
  "Noakhali",
  "Rangamati",
  // Sylhet division
  "Sylhet",
  "Habiganj",
  "Moulvibazar",
  "Sunamganj",
  // Rajshahi division
  "Rajshahi",
  "Bogura",
  "Chapainawabganj",
  "Joypurhat",
  "Naogaon",
  "Natore",
  "Pabna",
  "Sirajganj",
  // Khulna division
  "Khulna",
  "Bagerhat",
  "Chuadanga",
  "Jashore",
  "Jhenaidah",
  "Kushtia",
  "Magura",
  "Meherpur",
  "Narail",
  "Satkhira",
  // Barishal division
  "Barishal",
  "Barguna",
  "Bhola",
  "Jhalokati",
  "Patuakhali",
  "Pirojpur",
  // Rangpur division
  "Rangpur",
  "Dinajpur",
  "Gaibandha",
  "Kurigram",
  "Lalmonirhat",
  "Nilphamari",
  "Panchagarh",
  "Thakurgaon",
  // Mymensingh division
  "Mymensingh",
  "Jamalpur",
  "Netrokona",
  "Sherpur",
];

function escRx(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/locations?q=dh&limit=8
router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit || "8", 10))
    );
    if (!q) return res.json({ items: [] });

    let items = [];
    // যদি কালেকশন ফাঁকা থাকে, fallback ইউজ করবো
    const hasAny = await Location.estimatedDocumentCount().catch(() => 0);
    if (hasAny) {
      items = await Location.find(
        { name: { $regex: new RegExp(escRx(q), "i") } },
        { _id: 0, name: 1 }
      )
        .sort({ name: 1 })
        .limit(limit)
        .lean();
      items = items.map((d) => d.name);
    } else {
      const rx = new RegExp(escRx(q), "i");
      items = BD_LOCATIONS.filter((n) => rx.test(n)).slice(0, limit);
    }

    return res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
