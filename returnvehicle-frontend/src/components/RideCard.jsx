import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function RideCard({ ride }) {
  const [broken, setBroken] = useState(false);
  const jd = ride?.journeyDate
    ? new Date(ride.journeyDate).toISOString().slice(0, 10)
    : "—";
  const rd = ride?.returnDate
    ? new Date(ride.returnDate).toISOString().slice(0, 10)
    : null;
  const soldOut =
    typeof ride?.availableSeats === "number" && ride.availableSeats <= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Image */}
      {ride?.imageUrl && !broken ? (
        <img
          src={ride.imageUrl}
          alt={`${ride.from} to ${ride.to}`}
          className="h-44 w-full object-cover"
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="h-44 w-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
          No image
        </div>
      )}

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-base font-semibold text-slate-900">
            {ride.from} → {ride.to}
          </h4>
          <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
            {ride.category}
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-700">
          {jd}
          {rd ? ` • ${rd}` : ""}
        </p>

        <p className="mt-1 text-sm text-slate-700">
          {ride.vehicleModel || "—"}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-base font-semibold text-slate-900">
            ৳ {ride.price}
          </p>
          {soldOut ? (
            <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-700">
              Seat is not Available
            </span>
          ) : (
            <span className="text-xs text-slate-600">
              {ride.availableSeats ?? "—"}/{ride.totalSeats ?? "—"} seats
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Link
            to={`/booking/${ride._id}`}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
