import { adminAuth } from "../config/firebaseAdmin.js";
import { User } from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [, token] = authHeader.split(" ");
    if (!token)
      return res.status(401).json({ message: "Unauthorized: Missing token" });

    // Verify Firebase ID token
    const decoded = await adminAuth.verifyIdToken(token);
    const { uid, email, name, picture } = decoded;

    // Upsert user in DB (default role: 'user')
    const dbUser = await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          email: email || "",
          displayName: name || "",
          photoURL: picture || "",
        },
        $setOnInsert: { role: "user" },
      },
      { new: true, upsert: true }
    );

    req.authUser = {
      uid,
      email: dbUser.email,
      displayName: dbUser.displayName,
      photoURL: dbUser.photoURL,
      role: dbUser.role,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
