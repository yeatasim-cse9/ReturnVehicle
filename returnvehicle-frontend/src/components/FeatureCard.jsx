import React from "react";

export default function FeatureCard({ title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow transition">
      <div className="h-10 w-10 rounded-xl bg-slate-100 grid place-items-center text-slate-800 font-semibold">
        ✓
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-slate-600">{desc}</p>
    </div>
  );
}
