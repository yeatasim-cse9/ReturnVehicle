// returnvehicle-backend/scripts/make-admin.js
import "dotenv/config";
import mongoose from "mongoose";

async function run() {
  const { MONGO_URI } = process.env;
  if (!MONGO_URI) {
    console.error("❌ Missing MONGO_URI in .env");
    process.exit(1);
  }

  // Usage:
  // node scripts/make-admin.js --email=admin@gmail.com
  // or
  // node scripts/make-admin.js --uid=<firebase-uid>
  const emailArg = process.argv.find((a) => a.startsWith("--email="));
  const uidArg = process.argv.find((a) => a.startsWith("--uid="));

  const email = emailArg ? emailArg.split("=")[1] : null;
  const uid = uidArg ? uidArg.split("=")[1] : null;

  if (!email && !uid) {
    console.error(
      "❌ Usage: node scripts/make-admin.js --email=<email> OR --uid=<firebase-uid>"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    const coll = mongoose.connection.collection("users");

    const filter = uid ? { uid } : { email };
    const before = await coll.findOne(filter);

    if (!before) {
      console.error(
        "❌ No user found with that identifier in MongoDB users collection."
      );
      console.error(
        "ℹ️  প্রথমে ঐ ইমেইল/ইউজার দিয়ে আপনার অ্যাপে লগইন করুন যাতে users collection-এ সে তৈরি হয়।"
      );
      process.exit(1);
    }

    await coll.updateOne(filter, { $set: { role: "admin" } });
    const after = await coll.findOne(filter, {
      projection: { _id: 0, uid: 1, email: 1, role: 1 },
    });

    console.log("✅ Updated:", after);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();
