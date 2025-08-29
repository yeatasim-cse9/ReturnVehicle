import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchRides } from "../services/ridesApi";
import RideCard from "../components/RideCard";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}

export default function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });

  const query = useMemo(() => {
    const q = {
      from: sp.get("from") || "",
      to: sp.get("to") || "",
      journeyDate: sp.get("journeyDate") || "",
      returnDate: sp.get("returnDate") || "",
      category: sp.get("category") || "",
      passengers: sp.get("passengers") || "1",
      sort: sp.get("sort") || "date_asc",
      priceMin: sp.get("priceMin") || "",
      priceMax: sp.get("priceMax") || "",
      page: sp.get("page") || "1",
      limit: sp.get("limit") || "10",
    };
    return q;
  }, [sp]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const res = await searchRides(query);
        if (!mounted) return;
        setData(res);
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message || err?.message || "Failed to load"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [query]);

  const applyFilters = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = new URLSearchParams(sp);
    next.set("sort", form.get("sort"));
    const pmin = form.get("priceMin")?.trim();
    const pmax = form.get("priceMax")?.trim();
    if (pmin) next.set("priceMin", pmin);
    else next.delete("priceMin");
    if (pmax) next.set("priceMax", pmax);
    else next.delete("priceMax");
    next.set("page", "1");
    setSp(next);
  };

  const goPage = (p) => {
    const next = new URLSearchParams(sp);
    next.set("page", String(p));
    setSp(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Search Results</h2>
          <p className="mt-1 text-slate-600 text-sm">
            {query.from && (
              <>
                <strong className="text-slate-900">{query.from}</strong> →{" "}
              </>
            )}
            {query.to && <strong className="text-slate-900">{query.to}</strong>}
            {query.journeyDate && <> • {query.journeyDate}</>}
            {query.category && <> • {query.category}</>}
            {query.passengers && <> • {query.passengers} pax</>}
          </p>
        </div>

        {/* Filters */}
        <form
          onSubmit={applyFilters}
          className="rounded-xl border border-slate-200 bg-white p-3"
        >
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-slate-700">Sort</label>
              <select
                name="sort"
                defaultValue={query.sort}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900"
              >
                <option value="date_asc">Date ↑</option>
                <option value="date_desc">Date ↓</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-700">Price Min</label>
              <input
                type="number"
                name="priceMin"
                defaultValue={query.priceMin}
                min={0}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-700">Price Max</label>
              <input
                type="number"
                name="priceMax"
                defaultValue={query.priceMax}
                min={0}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900"
              />
            </div>
          </div>
          <div className="mt-2 text-right">
            <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:opacity-90">
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-6">
          <Spinner label="Loading rides..." />
        </div>
      ) : error ? (
        <p className="mt-6 text-slate-600">{error}</p>
      ) : data.items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700">No rides matched your search.</p>
          <Link
            to="/"
            className="mt-3 inline-block px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.items.map((r) => (
              <RideCard key={r._id} ride={r} passengers={query.passengers} />
            ))}
          </div>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
}
