// frontend/src/services/ridesApi.js
// All Ride-related API calls.
// Uses the pre-configured Axios instance at ../lib/api which adds baseURL & Auth header.

import api from "../lib/api";

/** Normalize and rethrow readable errors */
function unwrapError(err) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Request failed";
  const e = new Error(msg);
  e.status = err?.response?.status;
  e.data = err?.response?.data;
  throw e;
}

/**
 * Create a new ride (Driver only)
 * Backend: POST /api/rides
 * Body: {
 *  from, to, journeyDate, returnDate?, category('Ambulance'|'Car'|'Truck'),
 *  price(Number), vehicleModel, totalSeats(Number), availableSeats(Number),
 *  imageUrl?
 * }
 * Returns: { ride }
 */
export async function createRide(payload) {
  try {
    const res = await api.post("/api/rides", payload);
    return res.data?.ride || res.data;
  } catch (err) {
    unwrapError(err);
  }
}

/**
 * Get "My Rides" for current driver (paginated)
 * Backend: GET /api/rides/mine?page=&limit=
 * Returns: { items, total, page, pages, limit }
 */
export async function getMyRides(page = 1, limit = 12) {
  try {
    const res = await api.get("/api/rides/mine", { params: { page, limit } });
    return res.data;
  } catch (err) {
    unwrapError(err);
  }
}

/**
 * Update a ride (only the owner driver)
 * Backend: PATCH /api/rides/:id
 * Body: partial fields to update
 * Returns: { ride }
 */
export async function updateRide(id, patch = {}) {
  try {
    const res = await api.patch(`/api/rides/${id}`, patch);
    return res.data?.ride || res.data;
  } catch (err) {
    unwrapError(err);
  }
}

/**
 * Delete a ride (only the owner driver)
 * Backend: DELETE /api/rides/:id
 * Returns: { deleted: true }
 */
export async function deleteRide(id) {
  try {
    const res = await api.delete(`/api/rides/${id}`);
    return res.data;
  } catch (err) {
    unwrapError(err);
  }
}

/**
 * Public: Get a ride by id
 * Backend: GET /api/rides/:id
 * Returns: { ride }
 */
export async function getRideById(id) {
  try {
    const res = await api.get(`/api/rides/${id}`);
    return res.data?.ride || res.data;
  } catch (err) {
    unwrapError(err);
  }
}

/**
 * Public search
 * Backend (as implemented): GET /api/rides
 * Query params supported on backend:
 *  - from, to (string)
 *  - date (ISO date string, e.g. '2025-09-01')
 *  - category ('Ambulance'|'Car'|'Truck')
 *  - minPrice, maxPrice (numbers)
 *  - page, limit (numbers)
 * Returns: { items, total, page, pages, limit }
 */
export async function searchRides(params = {}) {
  try {
    const res = await api.get("/api/rides", { params });
    return res.data;
  } catch (err) {
    unwrapError(err);
  }
}
