import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getMyRides, deleteRide } from "../services/ridesApi";
import PostRideForm from "../components/PostRideForm";
import MyRideCard from "../components/MyRideCard";

export default function DriverDashboard() {
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRides = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getMyRides(p, limit);
      setRides(res.items || []);
      setPage(res.page || 1);
      setPages(res.pages || 1);
      setTotal(res.total || 0);
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

  const onCreated = () => {
    fetchRides(1);
  };

  const handleDelete = async (ride) => {
    if (!window.confirm("Delete this ride?")) return;
    try {
      setDeletingId(ride._id);
      await deleteRide(ride._id);
      toast.success("Ride deleted");
      fetchRides(page);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Driver Dashboard</h2>
      <p className="mt-1 text-slate-600 text-sm">
        Post rides and manage your listings.
      </p>

      {/* Post form */}
      <div className="mt-6">
        <PostRideForm onCreate={onCreated} />
      </div>

      {/* My Rides */}
      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">My Rides</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            Loading...
          </div>
        ) : (
          <span className="text-sm text-slate-600">{total} total</span>
        )}
      </div>

      {rides.length === 0 && !loading ? (
        <p className="mt-3 text-slate-700">
          You have not posted any rides yet.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rides.map((r) => (
            <MyRideCard key={r._id} ride={r} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
            onClick={() => fetchRides(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="text-sm text-slate-700">
            Page <strong className="text-slate-900">{page}</strong> of {pages}
          </span>
          <button
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
            onClick={() => fetchRides(page + 1)}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
