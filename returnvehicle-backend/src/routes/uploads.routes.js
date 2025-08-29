import { Router } from "express";
import multer from "multer";
import { imagekit } from "../config/imagekit.js";
import { requireAuth } from "../middlewares/auth.js";
import { env } from "../config/env.js";

const router = Router();

// --- Helpers ---
function assertImageKitConfigured() {
  if (
    !env.IMAGEKIT_PUBLIC_KEY ||
    !env.IMAGEKIT_PRIVATE_KEY ||
    !env.IMAGEKIT_URL_ENDPOINT
  ) {
    const miss = [];
    if (!env.IMAGEKIT_PUBLIC_KEY) miss.push("IMAGEKIT_PUBLIC_KEY");
    if (!env.IMAGEKIT_PRIVATE_KEY) miss.push("IMAGEKIT_PRIVATE_KEY");
    if (!env.IMAGEKIT_URL_ENDPOINT) miss.push("IMAGEKIT_URL_ENDPOINT");
    const err = new Error(
      `ImageKit not configured: missing ${miss.join(", ")}`
    );
    err.status = 500;
    throw err;
  }
}

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif", // কিছু ডিভাইস থেকে AVIF আসে
]);

// Multer: memory storage + proper status codes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(req, file, cb) {
    if (!file?.mimetype?.startsWith("image/")) {
      const er = new Error("Please upload an image file");
      er.status = 400;
      return cb(er);
    }
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      const er = new Error("Only JPG/PNG/WebP/AVIF allowed (max 5MB)");
      er.status = 400;
      return cb(er);
    }
    cb(null, true);
  },
});

/**
 * Quick debug
 * GET /api/uploads/_debug
 */
router.get("/_debug", async (req, res) => {
  const present = {
    IMAGEKIT_PUBLIC_KEY: !!env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: !!env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT: !!env.IMAGEKIT_URL_ENDPOINT,
  };
  try {
    assertImageKitConfigured();
    const list = await imagekit.listFiles({ limit: 1 });
    return res.json({
      ok: true,
      env: present,
      sample: Array.isArray(list)
        ? list.map((f) => ({ fileId: f.fileId, name: f.name })).slice(0, 1)
        : [],
    });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, env: present, message: e.message });
  }
});

/**
 * POST /api/uploads/image
 * Body: multipart/form-data → key: file (or "image")
 * Auth: any logged-in user
 */
router.post(
  "/image",
  requireAuth,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err?.code === "LIMIT_FILE_SIZE") {
        err.message = "File too large. Max 5MB allowed.";
        err.status = 413;
      }
      if (err) return next(err);
      if (!req.file) {
        // try fallback field "image"
        return upload.single("image")(req, res, (err2) => {
          if (err2?.code === "LIMIT_FILE_SIZE") {
            err2.message = "File too large. Max 5MB allowed.";
            err2.status = 413;
          }
          return next(err2);
        });
      }
      return next();
    });
  },
  async (req, res, next) => {
    try {
      assertImageKitConfigured();
      if (!req.file) {
        const er = new Error('No file uploaded (use field name "file")');
        er.status = 400;
        throw er;
      }

      const safeName = `${Date.now()}-${(
        req.file.originalname || "image"
      ).replace(/\s+/g, "_")}`;

      const result = await imagekit.upload({
        file: req.file.buffer, // Buffer
        fileName: safeName,
        folder: "returnvehicle/vehicles",
        useUniqueFileName: true,
      });

      return res.status(201).json({
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        fileId: result.fileId,
        name: result.name,
        size: result.size,
        width: result.width,
        height: result.height,
      });
    } catch (err) {
      if (
        err?.message?.includes("Invalid Public Key") ||
        err?.message?.includes("Unauthorized")
      ) {
        err.status = 500;
        err.message =
          "ImageKit credentials invalid. Check IMAGEKIT_PUBLIC/PRIVATE_KEY.";
      }
      next(err);
    }
  }
);

/**
 * DELETE /api/uploads/image/:fileId
 */
router.delete("/image/:fileId", requireAuth, async (req, res, next) => {
  try {
    assertImageKitConfigured();
    const { fileId } = req.params;
    if (!fileId) {
      const er = new Error("fileId required");
      er.status = 400;
      throw er;
    }
    await imagekit.deleteFile(fileId);
    return res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
