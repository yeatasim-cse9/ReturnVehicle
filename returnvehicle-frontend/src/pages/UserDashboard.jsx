import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyBookings, cancelBooking } from "../services/bookingsApi";
import { toast } from "react-hot-toast";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}

function formatDate(d) {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function canCancel(booking) {
  // allow cancel if status=booked AND journey date is in future
  const jd = booking?.ride?.journeyDate
    ? new Date(booking.ride.journeyDate)
    : null;
  const now = new Date();
  return booking?.status === "booked" && jd && jd.getTime() > now.getTime();
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [actingId, setActingId] = useState(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyBookings(page, 10);
      setData(res);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const goPage = (p) => {
    if (p < 1 || p > data.pages) return;
    fetchData(p);
  };

  const onCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      setActingId(id);
      const updated = await cancelBooking(id);
      setData((prev) => ({
        ...prev,
        items: prev.items.map((b) =>
          b._id === updated._id ? { ...b, status: updated.status } : b
        ),
      }));
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Cancel failed"
      );
    } finally {
      setActingId(null);
    }
  };

  const upcoming = useMemo(
    () =>
      (data.items || []).filter((b) => {
        const jd = b?.ride?.journeyDate ? new Date(b.ride.journeyDate) : null;
        return jd && jd.getTime() >= Date.now();
      }),
    [data.items]
  );
  const past = useMemo(
    () =>
      (data.items || []).filter((b) => {
        const jd = b?.ride?.journeyDate ? new Date(b.ride.journeyDate) : null;
        return jd && jd.getTime() < Date.now();
      }),
    [data.items]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <h2 className="text-2xl font-bold text-slate-900">User Dashboard</h2>
      <p className="mt-1 text-slate-600">
        Welcome back! Manage your bookings and profile.
      </p>

      {/* Profile summary */}
      <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">Profile</h3>
          <dl className="mt-2 text-sm text-slate-700 space-y-1">
            <div className="flex justify-between">
              <dt>Name</dt>
              <dd className="text-right">{user?.displayName || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Email</dt>
              <dd className="text-right break-all">{user?.email || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">Stats</h3>
          <dl className="mt-2 text-sm text-slate-700 space-y-1">
            <div className="flex justify-between">
              <dt>Total bookings</dt>
              <dd>{data.total}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Upcoming</dt>
              <dd>{upcoming.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Past</dt>
              <dd>{past.length}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">Quick Tips</h3>
          <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
            <li>You can cancel before journey date.</li>
            <li>Seat count and total fare are shown per booking.</li>
          </ul>
        </div>
      </section>

      {/* Bookings list */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">My Bookings</h3>
          {loading ? (
            <Spinner />
          ) : (
            <span className="text-sm text-slate-600">{data.total} total</span>
          )}
        </div>

        {loading ? (
          <div className="mt-4">
            <Spinner label="Loading bookings..." />
          </div>
        ) : error ? (
          <p className="mt-4 text-slate-700">{error}</p>
        ) : (data.items || []).length === 0 ? (
          <p className="mt-4 text-slate-700">You have no bookings yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-700">
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((b) => (
                  <tr key={b._id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-900">
                      {b?.ride?.from} → {b?.ride?.to}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {b?.ride?.journeyDate
                        ? formatDate(b.ride.journeyDate)
                        : "—"}
                      {b?.ride?.returnDate
                        ? ` • ${formatDate(b.ride.returnDate)}`
                        : ""}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {b?.ride?.vehicleModel || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{b?.seats}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      ৳ {b?.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                        {b?.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={!canCancel(b) || actingId === b._id}
                        onClick={() => onCancel(b._id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
                      >
                        {actingId === b._id ? "Cancelling…" : "Cancel"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && data.pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
              onClick={() => goPage(data.page - 1)}
              disabled={data.page <= 1}
            >
              Prev
            </button>
            <span className="text-sm text-slate-700">
              Page <strong className="text-slate-900">{data.page}</strong> of{" "}
              {data.pages}
            </span>
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
              onClick={() => goPage(data.page + 1)}
              disabled={data.page >= data.pages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
