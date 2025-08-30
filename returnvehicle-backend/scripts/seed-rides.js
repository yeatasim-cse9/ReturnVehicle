// returnvehicle-backend/scripts/seed-rides.js
import "dotenv/config";
import mongoose from "mongoose";
import { Ride } from "../src/models/Ride.js";

const URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!URI) {
  console.error("❌ MONGO_URI (or MONGODB_URI) missing in .env");
  process.exit(1);
}

// ড্রাইভার UID (আপনার driver অ্যাকাউন্টের Firebase UID দিলে ভাল)
const DRIVER_UID = process.env.SEED_DRIVER_UID || "DEMO_DRIVER_UID";
// SEED_RESET=1 দিলে পুরনো rides ক্লিয়ার করে শুরু হবে
const DO_RESET = String(process.env.SEED_RESET || "").trim() === "1";

// ক্যাটাগরি-ভিত্তিক কিছু অরিজিনাল (পাবলিক) ইমেজ
const CAR_IMAGES = [
  "https://images.unsplash.com/photo-1549921296-3c8c4f0a7081?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
];
const AMB_IMAGES = [
  "https://images.unsplash.com/photo-1519750283497-cf2910f7c2d3?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615461066841-3d5fb9f8f98e?q=80&w=1200&auto=format&fit=crop",
];
const TRUCK_IMAGES = [
  "https://images.unsplash.com/photo-1501706362039-c06b2d715385?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532703108239-9b82f3f34f2b?q=80&w=1200&auto=format&fit=crop",
];

const BD_LOCATIONS = [
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
  "Sylhet",
  "Habiganj",
  "Moulvibazar",
  "Sunamganj",
  "Rajshahi",
  "Bogura",
  "Chapainawabganj",
  "Joypurhat",
  "Naogaon",
  "Natore",
  "Pabna",
  "Sirajganj",
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
  "Barishal",
  "Barguna",
  "Bhola",
  "Jhalokati",
  "Patuakhali",
  "Pirojpur",
  "Rangpur",
  "Dinajpur",
  "Gaibandha",
  "Kurigram",
  "Lalmonirhat",
  "Nilphamari",
  "Panchagarh",
  "Thakurgaon",
  "Mymensingh",
  "Jamalpur",
  "Netrokona",
  "Sherpur",
];

const categories = ["Ambulance", "Car", "Truck"];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function randomRoute() {
  let a = pick(BD_LOCATIONS),
    b = pick(BD_LOCATIONS);
  while (b === a) b = pick(BD_LOCATIONS);
  return { from: a, to: b };
}
function randomDateWithin(days = 30) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const d = new Date(base);
  d.setDate(d.getDate() + rint(0, days));
  return d;
}
function imageFor(cat) {
  if (cat === "Ambulance") return pick(AMB_IMAGES);
  if (cat === "Truck") return pick(TRUCK_IMAGES);
  return pick(CAR_IMAGES);
}

async function run() {
  await mongoose.connect(URI);
  console.log("✅ Connected");

  if (DO_RESET) {
    await Ride.deleteMany({});
    console.log("🧹 Cleared rides collection");
  }

  const docs = [];

  // 12টি র‍্যান্ডম
  for (let i = 0; i < 12; i++) {
    const { from, to } = randomRoute();
    const journeyDate = randomDateWithin(30);
    const withReturn = Math.random() < 0.4;
    const ret = withReturn
      ? new Date(journeyDate.getTime() + rint(1, 5) * 86400000)
      : null;
    const cat = pick(categories);
    const totalSeats = cat === "Truck" ? 2 : rint(3, 7);
    const availableSeats = rint(0, totalSeats);
    const price = cat === "Ambulance" ? rint(3000, 7000) : rint(500, 4000);

    docs.push({
      driverId: DRIVER_UID,
      from,
      to,
      journeyDate,
      returnDate: ret,
      category: cat,
      price,
      vehicleModel:
        cat === "Truck"
          ? "Ashok Leyland"
          : cat === "Ambulance"
          ? "HiAce Ambulance"
          : "Toyota Axio",
      totalSeats,
      availableSeats,
      imageUrl: imageFor(cat), // ✅ অরিজিনাল ইমেজ URL
      imageFileId: "",
      status: "available",
    });
  }

  // 2025-09-01 তারিখে তিনটা ফোর্সড (আপনার সার্চ কুয়েরির সাথে মিলানোর জন্য)
  const forcedDate = new Date("2025-09-01T00:00:00.000Z");
  const forced = [
    {
      from: "Dhaka",
      to: "Sylhet",
      category: "Car",
      price: 1500,
      model: "Toyota Axio",
    },
    {
      from: "Dhaka",
      to: "Chattogram",
      category: "Car",
      price: 1800,
      model: "Allion",
    },
    {
      from: "Dhaka",
      to: "Rajshahi",
      category: "Ambulance",
      price: 5000,
      model: "HiAce Ambulance",
    },
  ].map((f) => ({
    driverId: DRIVER_UID,
    from: f.from,
    to: f.to,
    journeyDate: forcedDate,
    returnDate: null,
    category: f.category,
    price: f.price,
    vehicleModel: f.model,
    totalSeats: 4,
    availableSeats: rint(1, 4),
    imageUrl: imageFor(f.category), // ✅ ইমেজ
    imageFileId: "",
    status: "available",
  }));

  docs.push(...forced);

  const { insertedCount } = await Ride.collection.insertMany(docs);
  const total = await Ride.estimatedDocumentCount();
  console.log(`✅ Inserted ${insertedCount} rides`);
  console.log(`📦 rides collection total: ${total}`);

  await mongoose.disconnect();
  console.log("✅ Disconnected");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
