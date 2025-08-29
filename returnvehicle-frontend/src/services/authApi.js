import api from "../lib/api";
import { auth } from "../lib/firebase";

export async function setUserRole(role) {
  const token = await auth.currentUser.getIdToken();
  const res = await api.post(
    "/api/auth/set-role",
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function fetchWhoAmI() {
  const token = await auth.currentUser.getIdToken();
  const res = await api.get("/api/auth/whoami", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.user;
}
