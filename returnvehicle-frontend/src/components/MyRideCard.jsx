import React, { useState } from "react";

export default function MyRideCard({ ride, onEdit, onDelete }) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Image */}
      {ride?.imageUrl && !broken ? (
        <img
          src={ride.imageUrl}
          alt={`${ride.from} to ${ride.to}`}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="h-40 w-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
          No image
        </div>
      )}

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-slate-900">
            {ride.from} → {ride.to}
          </h4>
          <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
            {ride.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-700">
          {ride.journeyDate
            ? new Date(ride.journeyDate).toISOString().slice(0, 10)
            : "—"}
          {ride.returnDate
            ? ` • ${new Date(ride.returnDate).toISOString().slice(0, 10)}`
            : ""}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          {ride.vehicleModel || "—"}
        </p>
        <p className="mt-1 text-base font-medium text-slate-900">
          ৳ {ride.price}
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(ride)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(ride)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:opacity-90"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
