import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AutocompleteInput from "../components/AutocompleteInput";
import RideCard from "../components/RideCard";
import { searchRides } from "../services/ridesApi";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}

export default function RidesPage() {
  const [sp, setSp] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: 12,
  });

  const [onlyAvailable, setOnlyAvailable] = useState(true);

  // ✅ আজকের লোকাল তারিখ yyyy-mm-dd (টাইমজোন-সেইফ) — হোমপেজের মতো
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const query = useMemo(() => {
    return {
      from: sp.get("from") || "",
      to: sp.get("to") || "",
      date: sp.get("date") || "",
      category: sp.get("category") || "",
      sort: sp.get("sort") || "date_asc",
      minPrice: sp.get("minPrice") || "",
      maxPrice: sp.get("maxPrice") || "",
      page: sp.get("page") || "1",
      limit: sp.get("limit") || "12",
    };
  }, [sp]);

  // Load rides (unchanged functional logic)
  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await searchRides(query);
        if (!on) return;
        setData(res);
      } catch (e) {
        if (!on) return;
        setError(
          e?.response?.data?.message || e?.message || "Failed to load rides"
        );
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [query]);

  // client-side available filter (unchanged)
  const filteredItems = (data.items || []).filter((r) =>
    onlyAvailable
      ? r?.status === "available" && Number(r?.availableSeats) > 0
      : true
  );

  // হোমপেজের মতো past-date ব্লক রাখা হয়েছে
  const applyFilters = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = new URLSearchParams(sp);

    const from = form.get("from")?.toString().trim();
    const to = form.get("to")?.toString().trim();
    const date = form.get("date")?.toString().trim();
    const category = form.get("category")?.toString().trim();
    const sort = form.get("sort")?.toString().trim();
    const minPrice = form.get("minPrice")?.toString().trim();
    const maxPrice = form.get("maxPrice")?.toString().trim();

    if (date && date < todayStr) {
      window.alert("Past date নির্বাচন করা যাবে না।");
      return;
    }

    if (from) next.set("from", from);
    else next.delete("from");
    if (to) next.set("to", to);
    else next.delete("to");
    if (date) next.set("date", date);
    else next.delete("date");
    if (category) next.set("category", category);
    else next.delete("category");
    if (sort) next.set("sort", sort);
    else next.delete("sort");
    if (minPrice) next.set("minPrice", minPrice);
    else next.delete("minPrice");
    if (maxPrice) next.set("maxPrice", maxPrice);
    else next.delete("maxPrice");

    next.set("page", "1");
    setSp(next);
  };

  const clearFilters = () => {
    const keep = new URLSearchParams();
    keep.set("page", "1");
    keep.set("limit", query.limit || "12");
    setSp(keep);
  };

  const goPage = (p) => {
    const next = new URLSearchParams(sp);
    next.set("page", String(p));
    setSp(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header stays same */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            All Available Rides
          </h2>
          <p className="mt-1 text-slate-600 text-sm">
            Browse rides across Bangladesh. Use filters to refine your search.
          </p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
        >
          Back to Home
        </Link>
      </div>

      {/* Filters — হোমপেজের SearchForm এর মতো লে-আউট ও স্টাইল */}
      <form
        onSubmit={applyFilters}
        className="mt-6 rounded-3xl border border-slate-200/60 bg-white/95 backdrop-blur-sm p-6 shadow-xl shadow-slate-200/50"
      >
        {/* Route section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
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
                value={query.from}
                onChange={() => {}}
                placeholder="e.g., Dhaka"
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
                value={query.to}
                onChange={() => {}}
                placeholder="e.g., Sylhet"
              />
            </div>
          </div>

          {/* Trip details section */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                name="date"
                defaultValue={query.date}
                min={todayStr}
                className="w-full rounded-xl border-0 bg-white shadow-sm px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                name="passengers"
                min={1}
                defaultValue={Number(sp.get("passengers") || 1)}
                className="w-full rounded-xl border-0 bg-white shadow-sm px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Filters section */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-50/30 rounded-2xl border border-amber-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                name="category"
                defaultValue={query.category}
                className="w-full rounded-xl border-0 bg-white shadow-sm px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
              >
                <option value="">Any Vehicle</option>
                <option value="Ambulance">🚑 Ambulance</option>
                <option value="Car">🚗 Car</option>
                <option value="Truck">🚚 Truck</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                name="minPrice"
                min={0}
                defaultValue={query.minPrice}
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
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1"
                  />
                </svg>
                <label className="text-sm font-semibold text-slate-700">
                  Max Price (৳)
                </label>
              </div>
              <input
                type="number"
                name="maxPrice"
                min={0}
                defaultValue={query.maxPrice}
                placeholder="e.g., 3000"
                className="w-full rounded-xl border-0 bg-white shadow-sm px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-2">
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
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Apply Filters</span>
            </div>
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
          >
            Clear
          </button>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                id="onlyAvailable"
                type="checkbox"
                className="h-4 w-4"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
              <label htmlFor="onlyAvailable" className="text-sm text-slate-700">
                Only show available seats
              </label>
            </div>

            <label className="hidden md:block text-sm text-slate-700">
              Sort
              <select
                name="sort"
                defaultValue={query.sort}
                className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                onChange={(e) => {
                  const next = new URLSearchParams(sp);
                  next.set("sort", e.target.value);
                  next.set("page", "1");
                  setSp(next);
                }}
              >
                <option value="date_asc">Date ↑</option>
                <option value="date_desc">Date ↓</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
            </label>
          </div>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="mt-6">
          <Spinner label="Loading rides..." />
        </div>
      ) : error ? (
        <p className="mt-6 text-slate-600">{error}</p>
      ) : filteredItems.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700">No rides matched your filters.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((r) => (
              <RideCard key={r._id} ride={r} />
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
                onClick={() => goPage(Math.max(1, Number(data.page) - 1))}
                disabled={data.page <= 1}
              >
                Prev
              </button>
              <span className="text-sm text-slate-700">
                Page <strong className="text-slate-900">{data.page}</strong> of{" "}
                {data.pages}
              </span>
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
                onClick={() =>
                  goPage(Math.min(data.pages, Number(data.page) + 1))
                }
                disabled={data.page >= data.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
