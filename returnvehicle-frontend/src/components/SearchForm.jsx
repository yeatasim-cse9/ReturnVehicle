import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AutocompleteInput from "./AutocompleteInput";

export default function SearchForm() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(""); // ✅ MUST be "date" (not journeyDate)
  const [category, setCategory] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (from.trim()) sp.set("from", from.trim());
    if (to.trim()) sp.set("to", to.trim());
    if (date) sp.set("date", date); // ✅ backend expects `date`
    if (category) sp.set("category", category); // case-insensitive server-side
    if (passengers) sp.set("passengers", String(passengers));
    if (minPrice) sp.set("minPrice", String(minPrice));
    if (maxPrice) sp.set("maxPrice", String(maxPrice));
    sp.set("page", "1");
    sp.set("limit", "12");
    navigate(`/search?${sp.toString()}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-slate-200/60 bg-white/95 backdrop-blur-sm p-6 shadow-xl shadow-slate-200/50"
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Find Your Ride
          </h2>
          <p className="text-slate-600">
            Search for available transportation options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Route Section */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <label className="text-sm font-semibold text-slate-700">
                  Departure
                </label>
              </div>
              <AutocompleteInput
                label=""
                name="from"
                value={from}
                onChange={setFrom}
                placeholder="e.g., Dhaka"
                required
                className="border-0 bg-white shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <label className="text-sm font-semibold text-slate-700">
                  Destination
                </label>
              </div>
              <AutocompleteInput
                label=""
                name="to"
                value={to}
                onChange={setTo}
                placeholder="e.g., Sylhet"
                required
                className="border-0 bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Trip Details Section */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-100">
            {/* Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <label className="text-sm font-semibold text-slate-700">
                  Travel Date
                </label>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border-0 bg-white shadow-sm px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Passengers */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <label className="text-sm font-semibold text-slate-700">
                  Passengers
                </label>
              </div>
              <input
                type="number"
                min={1}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full rounded-xl border-0 bg-white shadow-sm px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-50/30 rounded-2xl border border-amber-100">
            {/* Category */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <label className="text-sm font-semibold text-slate-700">
                  Vehicle Type
                </label>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border-0 bg-white shadow-sm px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
              >
                <option value="">Any Vehicle</option>
                <option value="Ambulance">🚑 Ambulance</option>
                <option value="Car">🚗 Car</option>
                <option value="Truck">🚚 Truck</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <label className="text-sm font-semibold text-slate-700">
                  Min Price (৳)
                </label>
              </div>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="e.g., 500"
                className="w-full rounded-xl border-0 bg-white shadow-sm px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <label className="text-sm font-semibold text-slate-700">
                  Max Price (৳)
                </label>
              </div>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g., 3000"
                className="w-full rounded-xl border-0 bg-white shadow-sm px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            className="group relative px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-2xl hover:from-slate-700 hover:to-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Search Available Rides</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
