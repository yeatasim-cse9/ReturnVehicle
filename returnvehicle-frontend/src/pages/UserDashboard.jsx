import React, { useEffect, useState } from "react";
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
    return "—";
  }
}

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });
  const [acting, setActing] = useState(false);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getMyBookings(page, 10);
      setPageInfo(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, []);

  const goPage = (p) => {
    const next = Math.max(1, Math.min(pageInfo.pages, p));
    fetchBookings(next);
  };

  const onCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      setActing(true);
      const updated = await cancelBooking(id);
      setPageInfo((prev) => ({
        ...prev,
        items: prev.items.map((b) => (b._id === updated._id ? updated : b)),
      }));
      toast.success("Booking canceled");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Cancel failed"
      );
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">User Dashboard</h2>
      <p className="mt-2 text-slate-600">
        Your upcoming and past ride bookings.
      </p>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">My Bookings</h3>
          {loading ? (
            <Spinner />
          ) : (
            <span className="text-sm text-slate-600">
              {pageInfo.total} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="mt-4">
            <Spinner label="Loading bookings..." />
          </div>
        ) : (pageInfo.items || []).length === 0 ? (
          <p className="mt-2 text-slate-600">No bookings yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-700">
                  <th className="px-4 py-3">Booking Code</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageInfo.items.map((b) => {
                  const journey = b?.ride?.journeyDate
                    ? formatDate(b.ride.journeyDate)
                    : "—";
                  const back = b?.ride?.returnDate
                    ? formatDate(b.ride.returnDate)
                    : "";
                  const amount =
                    b.totalPrice ??
                    b.amount ??
                    (b.pricePerSeat || 0) * (b.passengers || 1);
                  const canCancel =
                    b.status === "confirmed" || b.status === "pending";

                  return (
                    <tr key={b._id} className="border-t border-slate-200">
                      <td className="px-4 py-3 text-slate-900">
                        {b.bookingCode || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {b?.ride?.from || "—"} → {b?.ride?.to || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {journey}
                        {back ? ` • ${back}` : ""}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {b.passengers ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        ৳ {amount}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                          {b.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onCancel(b._id)}
                          disabled={!canCancel || acting}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60 hover:bg-slate-50"
                          title={
                            canCancel
                              ? "Cancel booking"
                              : "Cannot cancel this booking"
                          }
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pageInfo.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
              onClick={() => goPage(pageInfo.page - 1)}
              disabled={pageInfo.page <= 1}
            >
              Prev
            </button>
            <span className="text-sm text-slate-700">
              Page <strong className="text-slate-900">{pageInfo.page}</strong>{" "}
              of {pageInfo.pages}
            </span>
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
              onClick={() => goPage(pageInfo.page + 1)}
              disabled={pageInfo.page >= pageInfo.pages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
