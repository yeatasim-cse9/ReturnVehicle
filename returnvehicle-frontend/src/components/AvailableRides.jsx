import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RideCard from "./RideCard";
import { searchRides } from "../services/ridesApi";
// ✨ UI ENHANCEMENT: Icons for empty and error states
import { SearchX, AlertTriangle } from "lucide-react";

// ✨ UI ENHANCEMENT: Skeleton loader for a better loading experience
function RideCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
      </div>
      <div className="mt-4 border-t border-slate-200 pt-3 flex items-center justify-between">
        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}

// ✨ UI ENHANCEMENT: A more visually appealing empty/error state component
function InfoState({ icon: Icon, title, message }) {
  return (
    <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 grid place-items-center">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <h4 className="mt-4 font-semibold text-slate-800">{title}</h4>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );
}

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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RideCardSkeleton key={i} />
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <InfoState
          icon={AlertTriangle}
          title="Something went wrong"
          message={error}
        />
      );
    }
    if (items.length === 0) {
      return (
        <InfoState
          icon={SearchX}
          title="No available rides found"
          message="There are currently no open seats. Please check back later or try a different search."
        />
      );
    }
    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((r) => (
          <RideCard key={r._id} ride={r} />
        ))}
      </div>
    );
  };

  return (
    <section>
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 font-semibold"
          >
            See all rides
          </Link>
        </div>
      )}
      {renderContent()}
    </section>
  );
}
