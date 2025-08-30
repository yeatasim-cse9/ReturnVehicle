import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RideCard from "./RideCard";
import { searchRides } from "../services/ridesApi";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}

/**
 * Props:
 * - showHeader: boolean (default true) -> heading + "See all" button দেখাবে
 * - initialLimit: number (default 8)   -> কতগুলো আইটেম লোড করবে
 */
export default function AvailableRides({
  showHeader = true,
  initialLimit = 8,
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await searchRides({
          sort: "date_asc",
          limit: initialLimit,
        });
        const list = (res?.items || []).filter(
          (r) => r?.status === "available" && Number(r?.availableSeats) > 0
        );
        if (on) setItems(list);
      } catch (e) {
        if (on) setError(e?.message || "Failed to load rides");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [initialLimit]);

  return (
    <section className="mt-10">
      {showHeader && (
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">
              Available Rides
            </h3>
            <p className="mt-1 text-slate-600 text-sm">
              Seats open now — book and go.
            </p>
          </div>

          <Link
            to="/rides"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
          >
            See all available rides
          </Link>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="mt-4">
          <Spinner />
        </div>
      ) : error ? (
        <p className="mt-4 text-slate-600">{error}</p>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700">No available rides right now.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((r) => (
            <RideCard key={r._id} ride={r} />
          ))}
        </div>
      )}
    </section>
  );
}
