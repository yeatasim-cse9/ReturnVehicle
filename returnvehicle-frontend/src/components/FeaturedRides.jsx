import React from "react";
import { Link } from "react-router-dom";

// Simple placeholder data (frontend-only). Backend যোগ হলে রিয়াল ডেটা দেখাবো।
const SAMPLE = [
  {
    id: 1,
    from: "Dhaka",
    to: "Chittagong",
    date: "2025-09-01",
    category: "Car",
    price: 3500,
    seats: "3/4",
  },
  {
    id: 2,
    from: "Sylhet",
    to: "Dhaka",
    date: "2025-09-02",
    category: "Ambulance",
    price: 5500,
    seats: "1/2",
  },
  {
    id: 3,
    from: "Khulna",
    to: "Rajshahi",
    date: "2025-09-03",
    category: "Truck",
    price: 8000,
    seats: "2/2",
  },
];

export default function FeaturedRides() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {SAMPLE.map((r) => (
        <article
          key={r.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow transition"
        >
          <div className="flex items-start justify-between">
            <h4 className="text-lg font-semibold text-slate-900">
              {r.from} → {r.to}
            </h4>
            <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
              {r.category}
            </span>
          </div>
          <p className="mt-1 text-slate-600 text-sm">Date: {r.date}</p>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-slate-900 font-semibold">৳ {r.price}</p>
            <p className="text-slate-600 text-sm">Seats: {r.seats}</p>
          </div>
          <Link
            to={`/booking/${r.id}`}
            className="mt-5 inline-block w-full text-center px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90"
          >
            View & Book
          </Link>
        </article>
      ))}
    </div>
  );
}
