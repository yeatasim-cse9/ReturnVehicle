import api from "../lib/api";
import { auth } from "../lib/firebase";

export async function getProfile() {
  const token = await auth.currentUser.getIdToken();
  const res = await api.get("/api/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.user;
}

export async function updateProfile(payload) {
  const token = await auth.currentUser.getIdToken();
  const res = await api.patch("/api/profile", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.user;
}
