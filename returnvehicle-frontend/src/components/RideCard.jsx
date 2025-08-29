import React from "react";
import { Link } from "react-router-dom";

function formatDate(d) {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function RideCard({ ride, passengers = 1 }) {
  const noSeat = Number(ride.availableSeats) < Number(passengers);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow transition">
      <div className="flex items-start justify-between">
        <h4 className="text-lg font-semibold text-slate-900">
          {ride.from} → {ride.to}
        </h4>
        <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
          {ride.category}
        </span>
      </div>
      <p className="mt-1 text-slate-600 text-sm">
        Journey: {formatDate(ride.journeyDate)}
        {ride.returnDate ? ` • Return: ${formatDate(ride.returnDate)}` : ""}
      </p>
      <p className="mt-1 text-slate-600 text-sm">
        Vehicle: {ride.vehicleModel} • Seats: {ride.availableSeats}/
        {ride.totalSeats}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-slate-900 font-semibold">৳ {ride.price}</p>
        <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
          {ride.status}
        </span>
      </div>
      {noSeat ? (
        <div className="mt-4 w-full text-center px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700">
          Seat is not Available
        </div>
      ) : (
        <Link
          to={`/booking/${ride._id}`}
          className="mt-4 inline-block w-full text-center px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90"
        >
          View & Book
        </Link>
      )}
    </article>
  );
}
