import React, { useState } from "react";
import PostRideForm from "../components/PostRideForm";

export default function DriverDashboard() {
  const [rides, setRides] = useState([]);

  const addRide = (ride) => {
    setRides((prev) => [ride, ...prev]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Driver Dashboard</h2>
      <p className="mt-2 text-slate-600">
        Post new rides, manage your listings and requests. (Frontend-only
        preview)
      </p>

      <div className="mt-6">
        <PostRideForm onCreate={addRide} />
      </div>

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900">My Rides</h3>
        {rides.length === 0 ? (
          <p className="mt-2 text-slate-600">
            No rides yet. Post your first ride above.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {rides.map((r) => (
              <li
                key={r.id}
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
                  Journey: {r.journeyDate}
                  {r.returnDate ? ` • Return: ${r.returnDate}` : ""}
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
                    onClick={() => alert("Edit coming soon")}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
                    onClick={() => alert("Requests management coming soon")}
                  >
                    Manage Requests
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
