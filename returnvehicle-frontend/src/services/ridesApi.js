import api from "../lib/api";
import { auth } from "../lib/firebase";

async function authHeader() {
  const token = await auth.currentUser?.getIdToken?.();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postRide(payload) {
  const res = await api.post("/api/rides", payload, {
    headers: await authHeader(),
  });
  return res.data.ride;
}

export async function getMyRides(page = 1, limit = 20) {
  const res = await api.get("/api/rides/mine", {
    params: { page, limit },
    headers: await authHeader(),
  });
  return res.data;
}

export async function deleteRide(id) {
  const res = await api.delete(`/api/rides/${id}`, {
    headers: await authHeader(),
  });
  return res.data;
}

export async function updateRide(id, data) {
  const res = await api.patch(`/api/rides/${id}`, data, {
    headers: await authHeader(),
  });
  return res.data.ride;
}

export async function searchRides(params) {
  const res = await api.get("/api/rides/search", { params });
  return res.data;
}

export async function getRideById(id) {
  const res = await api.get(`/api/rides/${id}`);
  return res.data.ride;
}
