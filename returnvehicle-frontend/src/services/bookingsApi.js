// returnvehicle-frontend/src/services/bookingsApi.js
import api from "./http";

/** User bookings list */
export async function getMyBookings(page = 1, limit = 10) {
  const { data } = await api.get(`/bookings/mine`, { params: { page, limit } });
  return data;
}

/** Driver bookings list (bookings on my rides) */
export async function getDriverBookings(page = 1, limit = 10) {
  const { data } = await api.get(`/bookings/driver`, {
    params: { page, limit },
  });
  return data;
}

/** Create a booking for a ride (User)
 * payload উদাহরণ:
 * {
 *   passengers: 1,
 *   contactName: "Your Name",
 *   contactPhone: "01XXXXXXXXX"
 * }
 */
export async function createBooking(rideId, payload) {
  const { data } = await api.post(`/rides/${rideId}/book`, payload);
  return data;
}

/** User cancel own booking */
export async function cancelBooking(id) {
  const { data } = await api.patch(`/bookings/${id}/cancel`);
  return data;
}

/** Driver accept a booking */
export async function acceptBooking(id) {
  const { data } = await api.patch(`/bookings/${id}/accept`);
  return data;
}

/** Driver reject a booking */
export async function rejectBooking(id) {
  const { data } = await api.patch(`/bookings/${id}/reject`);
  return data;
}
