import React from "react";

export default function Spinner({ label = "Please wait..." }) {
  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
        <p className="text-slate-700">{label}</p>
      </div>
    </div>
  );
}
