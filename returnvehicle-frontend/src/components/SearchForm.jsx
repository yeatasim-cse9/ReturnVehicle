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
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {/* From */}
        <div className="md:col-span-2">
          <AutocompleteInput
            label="From"
            name="from"
            value={from}
            onChange={setFrom}
            placeholder="e.g., Dhaka"
            required
          />
        </div>

        {/* To */}
        <div className="md:col-span-2">
          <AutocompleteInput
            label="To"
            name="to"
            value={to}
            onChange={setTo}
            placeholder="e.g., Sylhet"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">Any</option>
            <option value="Ambulance">Ambulance</option>
            <option value="Car">Car</option>
            <option value="Truck">Truck</option>
          </select>
        </div>

        {/* Passengers */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Passengers
          </label>
          <input
            type="number"
            min={1}
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Price Min */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Min Price (৳)
          </label>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g., 500"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Price Max */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Max Price (৳)
          </label>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g., 3000"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      <div className="mt-4 text-right">
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90"
        >
          Search
        </button>
      </div>
    </form>
  );
}
