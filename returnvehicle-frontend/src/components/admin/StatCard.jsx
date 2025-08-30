StatCard.jsx; // src/components/admin/StatCard.jsx
import React from "react";

export default function StatCard({
  title,
  value,
  loading,
  isComingSoon = false,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="text-sm font-medium text-slate-600">{title}</h3>
      {loading ? (
        <div className="mt-2 h-8 w-12 bg-slate-200 rounded animate-pulse"></div>
      ) : (
        <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
      )}
      {isComingSoon && (
        <span className="text-xs text-slate-500">Coming soon</span>
      )}
    </div>
  );
}
