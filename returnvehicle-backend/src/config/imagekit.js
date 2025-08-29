import ImageKit from "imagekit";
import { env } from "./env.js";

if (
  !env.IMAGEKIT_PUBLIC_KEY ||
  !env.IMAGEKIT_PRIVATE_KEY ||
  !env.IMAGEKIT_URL_ENDPOINT
) {
  console.warn(
    "⚠️ ImageKit env not fully set. Uploads will fail until keys are provided."
  );
}

export const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});
