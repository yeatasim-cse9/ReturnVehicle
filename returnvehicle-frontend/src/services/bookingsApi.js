import api from "../lib/api";
import { auth } from "../lib/firebase";

async function authHeader() {
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/**
 * Create a booking
 * payload: { rideId, seats, fullName, phone, note? }
 */
export async function createBooking(payload) {
  const res = await api.post("/api/bookings", payload, {
    headers: await authHeader(),
  });
  return res.data.booking;
}

/**
 * Get current user's bookings (paginated)
 */
export async function getMyBookings(page = 1, limit = 10) {
  const res = await api.get("/api/bookings/mine", {
    params: { page, limit },
    headers: await authHeader(),
  });
  return res.data;
}

/**
 * Cancel a booking (only if status=booked and journey in future)
 */
export async function cancelBooking(id) {
  const res = await api.patch(
    `/api/bookings/${id}/cancel`,
    {},
    {
      headers: await authHeader(),
    }
  );
  return res.data.booking;
}

/**
 * Driver: list bookings on my rides (paginated)
 */
export async function getDriverBookings(page = 1, limit = 10) {
  const res = await api.get("/api/bookings/driver", {
    params: { page, limit },
    headers: await authHeader(),
  });
  return res.data;
}
