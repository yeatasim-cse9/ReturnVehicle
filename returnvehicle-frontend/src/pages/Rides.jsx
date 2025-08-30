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

  // Load rides
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

  // client-side available filter
  const filteredItems = (data.items || []).filter((r) =>
    onlyAvailable
      ? r?.status === "available" && Number(r?.availableSeats) > 0
      : true
  );

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

      {/* Filters */}
      <form
        onSubmit={applyFilters}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <AutocompleteInput
              label="From"
              name="from"
              value={query.from}
              onChange={() => {}}
              placeholder="e.g., Dhaka"
            />
          </div>
          <div className="md:col-span-2">
            <AutocompleteInput
              label="To"
              name="to"
              value={query.to}
              onChange={() => {}}
              placeholder="e.g., Sylhet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              defaultValue={query.date}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              name="category"
              defaultValue={query.category}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">Any</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Car">Car</option>
              <option value="Truck">Truck</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Sort
            </label>
            <select
              name="sort"
              defaultValue={query.sort}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="date_asc">Date ↑</option>
              <option value="date_desc">Date ↓</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Min Price (৳)
            </label>
            <input
              type="number"
              name="minPrice"
              min={0}
              defaultValue={query.minPrice}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="e.g., 500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Max Price (৳)
            </label>
            <input
              type="number"
              name="maxPrice"
              min={0}
              defaultValue={query.maxPrice}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="e.g., 3000"
            />
          </div>
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
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
          >
            Clear
          </button>
          <span className="ml-auto text-sm text-slate-600">
            Showing{" "}
            <span className="text-slate-900 font-medium">
              {filteredItems.length}
            </span>{" "}
            of {data.total}
          </span>
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
