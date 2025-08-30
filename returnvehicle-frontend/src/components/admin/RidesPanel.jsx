// src/components/admin/RidesPanel.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { adminListRides, adminDeleteRide } from "../../services/adminApi";
import { Trash2 } from "lucide-react";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="inline-flex items-center gap-2 text-slate-600 text-sm">
      {" "}
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />{" "}
      {label}{" "}
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

export default function RidesPanel() {
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const data = await adminListRides({ limit: 100 });
      setRides(data.items || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load rides");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this ride permanently?")
    )
      return;
    try {
      await adminDeleteRide(id);
      setRides(rides.filter((r) => r._id !== id));
      toast.success("Ride deleted");
    } catch (err) {
      toast.error(err?.message || "Failed to delete ride");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-slate-600 font-medium">
            <th className="px-4 py-3">Route</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Seats</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rides.map((ride) => (
            <tr key={ride._id}>
              <td className="px-4 py-3 font-medium text-slate-900">
                {ride.from} → {ride.to}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {formatDate(ride.journeyDate)}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {ride.category} ({ride.vehicleModel})
              </td>
              <td className="px-4 py-3 text-slate-600">৳{ride.price}</td>
              <td className="px-4 py-3 text-slate-600">
                {ride.availableSeats}/{ride.totalSeats}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete(ride._id)}
                  className="p-2 rounded-md hover:bg-red-100 text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
