import { connectDB } from "../utils/db.js";
import { Location } from "../models/Location.js";
import { env } from "../config/env.js";

const LOCATIONS = [
  // Dhaka Division
  { name: "Dhaka", division: "Dhaka", alt: [] },
  { name: "Gazipur", division: "Dhaka", alt: [] },
  { name: "Kishoreganj", division: "Dhaka", alt: [] },
  { name: "Manikganj", division: "Dhaka", alt: [] },
  { name: "Munshiganj", division: "Dhaka", alt: [] },
  { name: "Narayanganj", division: "Dhaka", alt: [] },
  { name: "Narsingdi", division: "Dhaka", alt: [] },
  { name: "Tangail", division: "Dhaka", alt: [] },
  { name: "Faridpur", division: "Dhaka", alt: [] },
  { name: "Gopalganj", division: "Dhaka", alt: [] },
  { name: "Madaripur", division: "Dhaka", alt: [] },
  { name: "Rajbari", division: "Dhaka", alt: [] },
  { name: "Shariatpur", division: "Dhaka", alt: [] },

  // Chattogram Division
  { name: "Chattogram", division: "Chattogram", alt: ["Chittagong"] },
  { name: "Cox's Bazar", division: "Chattogram", alt: [] },
  { name: "Cumilla", division: "Chattogram", alt: ["Comilla"] },
  { name: "Brahmanbaria", division: "Chattogram", alt: [] },
  { name: "Chandpur", division: "Chattogram", alt: [] },
  { name: "Feni", division: "Chattogram", alt: [] },
  { name: "Lakshmipur", division: "Chattogram", alt: ["Laxmipur"] },
  { name: "Noakhali", division: "Chattogram", alt: [] },
  { name: "Khagrachhari", division: "Chattogram", alt: [] },
  { name: "Rangamati", division: "Chattogram", alt: [] },
  { name: "Bandarban", division: "Chattogram", alt: [] },

  // Sylhet Division
  { name: "Sylhet", division: "Sylhet", alt: [] },
  { name: "Moulvibazar", division: "Sylhet", alt: ["Maulvibazar"] },
  { name: "Habiganj", division: "Sylhet", alt: [] },
  { name: "Sunamganj", division: "Sylhet", alt: [] },

  // Rajshahi Division
  { name: "Rajshahi", division: "Rajshahi", alt: [] },
  { name: "Bogura", division: "Rajshahi", alt: ["Bogra"] },
  { name: "Joypurhat", division: "Rajshahi", alt: [] },
  { name: "Naogaon", division: "Rajshahi", alt: [] },
  { name: "Natore", division: "Rajshahi", alt: [] },
  {
    name: "Chapai Nawabganj",
    division: "Rajshahi",
    alt: ["Nawabganj", "Chapainawabganj"],
  },
  { name: "Sirajganj", division: "Rajshahi", alt: [] },
  { name: "Pabna", division: "Rajshahi", alt: [] },

  // Rangpur Division
  { name: "Rangpur", division: "Rangpur", alt: [] },
  { name: "Dinajpur", division: "Rangpur", alt: [] },
  { name: "Kurigram", division: "Rangpur", alt: [] },
  { name: "Gaibandha", division: "Rangpur", alt: [] },
  { name: "Lalmonirhat", division: "Rangpur", alt: [] },
  { name: "Nilphamari", division: "Rangpur", alt: [] },
  { name: "Panchagarh", division: "Rangpur", alt: [] },
  { name: "Thakurgaon", division: "Rangpur", alt: [] },

  // Khulna Division
  { name: "Khulna", division: "Khulna", alt: [] },
  { name: "Bagerhat", division: "Khulna", alt: [] },
  { name: "Satkhira", division: "Khulna", alt: [] },
  { name: "Jashore", division: "Khulna", alt: ["Jessore"] },
  { name: "Jhenaidah", division: "Khulna", alt: [] },
  { name: "Narail", division: "Khulna", alt: [] },
  { name: "Kushtia", division: "Khulna", alt: [] },
  { name: "Chuadanga", division: "Khulna", alt: [] },
  { name: "Meherpur", division: "Khulna", alt: [] },
  { name: "Magura", division: "Khulna", alt: [] },

  // Barishal Division
  { name: "Barishal", division: "Barishal", alt: ["Barisal"] },
  { name: "Bhola", division: "Barishal", alt: [] },
  { name: "Patuakhali", division: "Barishal", alt: [] },
  { name: "Pirojpur", division: "Barishal", alt: [] },
  { name: "Barguna", division: "Barishal", alt: [] },
  { name: "Jhalokati", division: "Barishal", alt: [] },

  // Mymensingh Division
  { name: "Mymensingh", division: "Mymensingh", alt: [] },
  { name: "Jamalpur", division: "Mymensingh", alt: [] },
  { name: "Sherpur", division: "Mymensingh", alt: [] },
  { name: "Netrokona", division: "Mymensingh", alt: [] },
];

async function seed() {
  await connectDB();
  console.log("Seeding locations...");

  for (const loc of LOCATIONS) {
    await Location.updateOne(
      { name: loc.name },
      {
        $set: {
          name: loc.name,
          division: loc.division,
          type: "district",
          alt: loc.alt || [],
          normalizedName: (loc.name || "").toLowerCase(),
        },
      },
      { upsert: true }
    );
  }

  const count = await Location.countDocuments();
  console.log(`✅ Locations upserted. Total documents: ${count}`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
