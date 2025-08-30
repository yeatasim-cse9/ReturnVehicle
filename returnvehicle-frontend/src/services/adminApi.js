import api from "../lib/api";
import { auth } from "../lib/firebase";

async function authHeader() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/**
 * Admin: list users (paginated)
 */
export async function adminListUsers({
  query = "",
  role = "",
  status = "",
  page = 1,
  limit = 10,
} = {}) {
  const res = await api.get("/api/admin/users", {
    params: { query, role, status, page, limit },
    headers: await authHeader(),
  });
  return res.data;
}

/**
 * Admin: update a user (role/status)
 */
export async function adminUpdateUser(uid, payload) {
  const res = await api.patch(`/api/admin/users/${uid}`, payload, {
    headers: await authHeader(),
  });
  return res.data.user;
}

/**
 * Admin: list rides (paginated)
 */
export async function adminListRides({ page = 1, limit = 10 } = {}) {
  const res = await api.get("/api/admin/rides", {
    params: { page, limit },
    headers: await authHeader(),
  });
  return res.data;
}

/**
 * Admin: delete ride by id
 */
export async function adminDeleteRide(id) {
  const res = await api.delete(`/api/admin/rides/${id}`, {
    headers: await authHeader(),
  });
  return res.data;
}
