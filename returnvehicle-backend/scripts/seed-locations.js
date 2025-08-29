import "dotenv/config";
import mongoose from "mongoose";
import { Location } from "../src/models/Location.js";

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

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGO_URI missing");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("✅ Connected");

  const ops = BD_LOCATIONS.map((name) => ({
    updateOne: {
      filter: { name },
      update: { $setOnInsert: { name } },
      upsert: true,
    },
  }));
  await Location.bulkWrite(ops);
  const total = await Location.estimatedDocumentCount();
  console.log("✅ Seeded locations. Total:", total);

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
