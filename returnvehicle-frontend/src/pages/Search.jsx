import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Search() {
  const q = useQuery();
  const from = q.get("from") || "";
  const to = q.get("to") || "";
  const journeyDate = q.get("journeyDate") || "";
  const returnDate = q.get("returnDate") || "";
  const category = q.get("category") || "";
  const passengers = q.get("passengers") || "";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Search Results</h2>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-slate-500">From</p>
            <p className="font-medium text-slate-900">{from || "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-slate-500">To</p>
            <p className="font-medium text-slate-900">{to || "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-slate-500">Category</p>
            <p className="font-medium text-slate-900">{category || "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-slate-500">Journey Date</p>
            <p className="font-medium text-slate-900">{journeyDate || "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-slate-500">Return Date</p>
            <p className="font-medium text-slate-900">{returnDate || "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-slate-500">Passengers</p>
            <p className="font-medium text-slate-900">{passengers || "—"}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-slate-600">
            Backend যুক্ত হলে এখানে ম্যাচিং রাইডগুলোর লিস্ট দেখাবো (filters,
            sort, pagination সহ)।
          </p>
        </div>
      </div>
    </div>
  );
}
