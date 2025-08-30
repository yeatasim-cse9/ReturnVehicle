import api from "../lib/api";
import { auth } from "../lib/firebase";

// নিশ্চিত করুন "export" শব্দটি এখানে আছে
export async function setUserRole(role) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const res = await api.post(
    "/api/auth/set-role",
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// "export" এখানেও আছে
export async function fetchWhoAmI() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const cacheBustUrl = `/api/auth/whoami?_=${new Date().getTime()}`;
  const res = await api.get(cacheBustUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.user;
}

// "export" এখানেও আছে
export async function updateProfile({
  role,
  displayName,
  photoURL,
  phoneNumber,
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const payload = {};
  if (role) payload.role = role;
  if (displayName != null) payload.displayName = displayName;
  if (photoURL != null) payload.photoURL = photoURL;
  if (phoneNumber != null) payload.phoneNumber = phoneNumber;

  const res = await api.post("/api/auth/set-role", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.user;
}
