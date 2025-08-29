import React, { useEffect, useMemo, useState } from "react";
import PostRideForm from "../components/PostRideForm";
import { getMyRides, deleteRide, updateRide } from "../services/ridesApi";
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

export default function DriverDashboard() {
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

  useEffect(() => {
    fetchRides(1);
  }, []);

  const onCreate = (ride) => {
    setRides((prev) => [ride, ...prev]);
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEdit({
      price: r.price,
      availableSeats: r.availableSeats,
      totalSeats: r.totalSeats,
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Driver Dashboard</h2>
      <p className="mt-2 text-slate-600">
        Post new rides, manage your listings and requests.
      </p>

      <div className="mt-6">
        <PostRideForm onCreate={onCreate} />
      </div>

      <section className="mt-8">
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
                  {r.returnDate ? ` • Return: ${formatDate(r.returnDate)}` : ""}
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

                {/* Actions */}
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

                {/* Inline edit panel */}
                {editingId === r._id && (
                  <div className="mt-4 rounded-xl border border-slate-200 p-4 bg-slate-50">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-700">
                          Price
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={edit.price}
                          onChange={(e) =>
                            setEdit((p) => ({ ...p, price: e.target.value }))
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
                          type="number"
                          min={1}
                          max={50}
                          value={edit.totalSeats}
                          onChange={(e) =>
                            setEdit((p) => ({
                              ...p,
                              totalSeats: e.target.value,
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
                          type="number"
                          min={0}
                          max={edit.totalSeats || 50}
                          value={edit.availableSeats}
                          onChange={(e) =>
                            setEdit((p) => ({
                              ...p,
                              availableSeats: e.target.value,
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
      </section>
    </div>
  );
}
