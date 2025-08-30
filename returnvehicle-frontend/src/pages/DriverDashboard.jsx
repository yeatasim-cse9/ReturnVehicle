import React, { useEffect, useState } from "react";
import PostRideForm from "../components/PostRideForm";
import { getMyRides, deleteRide, updateRide } from "../services/ridesApi";
import {
  getDriverBookings,
  acceptBooking,
  rejectBooking,
} from "../services/bookingsApi";
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

/* ---- Helpers: Bengali → English digits ---- */
const bnToEnMap = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};
function normalizeDigits(str) {
  return String(str ?? "").replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
}
function onlyInts(str) {
  // 1) convert Bengali digits to English 2) keep only ASCII digits 0-9
  return normalizeDigits(str).replace(/[^\d]/g, "");
}

export default function DriverDashboard() {
  const [tab, setTab] = useState("rides"); // 'rides' | 'bookings'

  // ---- Rides state ----
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    total: 0,
    pages: 1,
    limit: 20,
  });
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({
    price: "",
    availableSeats: "",
    totalSeats: "",
    vehicleModel: "",
    status: "available",
  });
  const [acting, setActing] = useState(false);

  // ---- Bookings state (driver) ----
  const [bkLoading, setBkLoading] = useState(false);
  const [bk, setBk] = useState({
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [bkActingId, setBkActingId] = useState(null);

  // Load rides
  const fetchRides = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getMyRides(page, 20);
      setRides(data.items || []);
      setPageInfo({
        page: data.page,
        total: data.total,
        pages: data.pages,
        limit: data.limit,
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load rides"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load driver bookings
  const fetchBookings = async (page = 1) => {
    setBkLoading(true);
    try {
      const data = await getDriverBookings(page, 10);
      setBk(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load bookings"
      );
    } finally {
      setBkLoading(false);
    }
  };

  useEffect(() => {
    fetchRides(1);
  }, []);

  useEffect(() => {
    if (tab === "bookings") fetchBookings(1);
  }, [tab]);

  const onCreate = (ride) => {
    setRides((prev) => [ride, ...prev]);
  };

  // Start edit with strings
  const startEdit = (r) => {
    setEditingId(r._id);
    setEdit({
      price: String(r.price ?? ""),
      availableSeats: String(r.availableSeats ?? ""),
      totalSeats: String(r.totalSeats ?? ""),
      vehicleModel: r.vehicleModel,
      status: r.status || "available",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEdit({
      price: "",
      availableSeats: "",
      totalSeats: "",
      vehicleModel: "",
      status: "available",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const payload = {
      price: Number(edit.price),
      availableSeats: Number(edit.availableSeats),
      totalSeats: Number(edit.totalSeats),
      vehicleModel: String(edit.vehicleModel).trim(),
      status: edit.status,
    };
    if (!(payload.price > 0)) return toast.error("Price must be > 0");
    if (!(payload.totalSeats >= 1))
      return toast.error("Total seats must be >= 1");
    if (
      !(
        payload.availableSeats >= 0 &&
        payload.availableSeats <= payload.totalSeats
      )
    ) {
      return toast.error("Available seats must be between 0 and total seats");
    }

    try {
      setActing(true);
      const updated = await updateRide(editingId, payload);
      setRides((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );
      toast.success("Ride updated");
      cancelEdit();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Update failed"
      );
    } finally {
      setActing(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this ride?")) return;
    try {
      setActing(true);
      await deleteRide(id);
      setRides((prev) => prev.filter((r) => r._id !== id));
      toast.success("Ride deleted");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Delete failed"
      );
    } finally {
      setActing(false);
    }
  };

  const goRidePage = (p) => {
    const page = Math.max(1, Math.min(pageInfo.pages, p));
    fetchRides(page);
  };
  const goBookingPage = (p) => {
    const page = Math.max(1, Math.min(bk.pages, p));
    fetchBookings(page);
  };

  // --- Driver actions on bookings ---
  const doAccept = async (id) => {
    try {
      setBkActingId(id);
      const updated = await acceptBooking(id);
      setBk((prev) => ({
        ...prev,
        items: prev.items.map((x) => (x._id === updated._id ? updated : x)),
      }));
      toast.success("Booking accepted (confirmed)");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Accept failed"
      );
    } finally {
      setBkActingId(null);
    }
  };

  const doReject = async (id) => {
    try {
      setBkActingId(id);
      const updated = await rejectBooking(id);
      setBk((prev) => ({
        ...prev,
        items: prev.items.map((x) => (x._id === updated._id ? updated : x)),
      }));
      toast.success("Booking rejected");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Reject failed"
      );
    } finally {
      setBkActingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Driver Dashboard</h2>
      <p className="mt-2 text-slate-600">
        Post new rides, manage your listings, and view bookings for your rides.
      </p>

      {/* Post Ride */}
      <div className="mt-6">
        <PostRideForm onCreate={onCreate} />
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-slate-200">
        <nav className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-t-xl ${
              tab === "rides"
                ? "bg-white border border-b-0 border-slate-200 text-slate-900"
                : "bg-slate-50 text-slate-700"
            }`}
            onClick={() => setTab("rides")}
          >
            My Rides
          </button>
          <button
            className={`px-4 py-2 rounded-t-xl ${
              tab === "bookings"
                ? "bg-white border border-b-0 border-slate-200 text-slate-900"
                : "bg-slate-50 text-slate-700"
            }`}
            onClick={() => setTab("bookings")}
          >
            Bookings
          </button>
        </nav>
      </div>

      {/* Panels */}
      {tab === "rides" ? (
        <section className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">My Rides</h3>
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
              <Spinner label="Loading rides..." />
            </div>
          ) : rides.length === 0 ? (
            <p className="mt-2 text-slate-600">
              No rides yet. Post your first ride above.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {rides.map((r) => (
                <li
                  key={r._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-lg font-semibold text-slate-900">
                      {r.from} → {r.to}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                      {r.category}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600 text-sm">
                    Journey: {formatDate(r.journeyDate)}
                    {r.returnDate
                      ? ` • Return: ${formatDate(r.returnDate)}`
                      : ""}
                  </p>
                  <p className="mt-1 text-slate-600 text-sm">
                    Vehicle: {r.vehicleModel} • Seats: {r.availableSeats}/
                    {r.totalSeats}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-slate-900 font-semibold">৳ {r.price}</p>
                    <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                      {r.status}
                    </span>
                  </div>
                  {r.imageUrl && (
                    <img
                      src={r.imageUrl}
                      alt="vehicle"
                      className="mt-3 h-36 w-full rounded-xl object-cover border border-slate-200"
                    />
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                      onClick={() => startEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
                      onClick={() => onDelete(r._id)}
                      disabled={acting}
                    >
                      Delete
                    </button>
                  </div>

                  {editingId === r._id && (
                    <div className="mt-4 rounded-xl border border-slate-200 p-4 bg-slate-50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-slate-700">
                            Price
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={edit.price}
                            onChange={(e) =>
                              setEdit((p) => ({
                                ...p,
                                price: onlyInts(e.target.value),
                              }))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-700">
                            Vehicle Model
                          </label>
                          <input
                            type="text"
                            value={edit.vehicleModel}
                            onChange={(e) =>
                              setEdit((p) => ({
                                ...p,
                                vehicleModel: e.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-700">
                            Total Seats
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={edit.totalSeats}
                            onChange={(e) =>
                              setEdit((p) => ({
                                ...p,
                                totalSeats: onlyInts(e.target.value),
                              }))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-700">
                            Available Seats
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={edit.availableSeats}
                            onChange={(e) =>
                              setEdit((p) => ({
                                ...p,
                                availableSeats: onlyInts(e.target.value),
                              }))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-700">
                            Status
                          </label>
                          <select
                            value={edit.status}
                            onChange={(e) =>
                              setEdit((p) => ({ ...p, status: e.target.value }))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          >
                            <option value="available">available</option>
                            <option value="unavailable">unavailable</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                          onClick={cancelEdit}
                          disabled={acting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
                          onClick={saveEdit}
                          disabled={acting}
                        >
                          {acting ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!loading && pageInfo.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
                onClick={() => goRidePage(pageInfo.page - 1)}
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
                onClick={() => goRidePage(pageInfo.page + 1)}
                disabled={pageInfo.page >= pageInfo.pages}
              >
                Next
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Bookings on My Rides
            </h3>
            {bkLoading ? (
              <Spinner />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{bk.total} total</span>
                <button
                  type="button"
                  onClick={() => fetchBookings(bk.page)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>

          {bkLoading ? (
            <div className="mt-4">
              <Spinner label="Loading bookings..." />
            </div>
          ) : (bk.items || []).length === 0 ? (
            <p className="mt-2 text-slate-600">No bookings yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-700">
                    <th className="px-4 py-3">Passenger</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bk.items.map((b) => {
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

                    const canAccept =
                      b.status === "pending" || b.status === "rejected";
                    const canReject =
                      b.status === "pending" || b.status === "confirmed";

                    return (
                      <tr key={b._id} className="border-t border-slate-200">
                        <td className="px-4 py-3 text-slate-900">
                          {b.contactName || b.passengerName || b.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {b.contactPhone || b.phone || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {b.passengers}
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          ৳ {amount}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {b?.ride?.from} → {b?.ride?.to}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {journey}
                          {back ? ` • ${back}` : ""}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => doAccept(b._id)}
                              disabled={!canAccept || bkActingId === b._id}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60 hover:bg-slate-50"
                            >
                              {bkActingId === b._id ? "…" : "Accept"}
                            </button>
                            <button
                              type="button"
                              onClick={() => doReject(b._id)}
                              disabled={!canReject || bkActingId === b._id}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white disabled:opacity-60 hover:opacity-90"
                            >
                              {bkActingId === b._id ? "…" : "Reject"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!bkLoading && bk.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
                onClick={() => goBookingPage(bk.page - 1)}
                disabled={bk.page <= 1}
              >
                Prev
              </button>
              <span className="text-sm text-slate-700">
                Page <strong className="text-slate-900">{bk.page}</strong> of{" "}
                {bk.pages}
              </span>
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
                onClick={() => goBookingPage(bk.page + 1)}
                disabled={bk.page >= bk.pages}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
