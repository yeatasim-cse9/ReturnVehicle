import api from "../lib/api";
import { auth } from "../lib/firebase";

async function authHeader() {
  const u = auth.currentUser;
  if (!u) throw new Error("Not authenticated");
  const t = await u.getIdToken();
  return { Authorization: `Bearer ${t}` };
}

/**
 * Upload an image to backend → ImageKit
 * @param {File} file
 * @param {(percent:number)=>void} onProgress
 * @returns {Promise<{url:string, fileId:string, thumbnailUrl?:string, name:string, size:number, width?:number, height?:number}>}
 */
export async function uploadImage(file, onProgress) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post("/api/uploads/image", fd, {
    headers: await authHeader(),
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      const p = Math.round((evt.loaded * 100) / evt.total);
      if (onProgress) onProgress(p);
    },
  });
  return res.data;
}

/**
 * Delete an uploaded image by fileId (ImageKit)
 */
export async function deleteImage(fileId) {
  const res = await api.delete(`/api/uploads/image/${fileId}`, {
    headers: await authHeader(),
  });
  return res.data;
}
