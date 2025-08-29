import api from "../lib/api";
import { auth } from "../lib/firebase";

async function authHeader() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/**
 * Create a ride (driver)
 * payload: {
 *   from, to, journeyDate, returnDate?, category, price,
 *   vehicleModel, totalSeats, availableSeats, imageUrl?
 * }
 */
export async function createRide(payload) {
  const res = await api.post("/api/rides", payload, {
    headers: await authHeader(),
  });
  return res.data.ride;
}

export async function getRideById(id) {
  const res = await api.get(`/api/rides/${id}`);
  return res.data.ride;
}

/**
 * Driver: list own rides
 */
export async function getMyRides(page = 1, limit = 20) {
  const res = await api.get("/api/rides/mine", {
    params: { page, limit },
    headers: await authHeader(),
  });
  return res.data;
}

/**
 * Driver: update ride
 */
export async function updateRide(id, payload) {
  const res = await api.patch(`/api/rides/${id}`, payload, {
    headers: await authHeader(),
  });
  return res.data.ride;
}

/**
 * Driver: delete ride
 */
export async function deleteRide(id) {
  const res = await api.delete(`/api/rides/${id}`, {
    headers: await authHeader(),
  });
  return res.data;
}

/**
 * Public search
 */
export async function searchRides(params) {
  const res = await api.get("/api/rides/search", { params });
  return res.data;
}
