import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <div className="max-w-md text-center">
        <h2 className="text-3xl font-bold text-slate-900">Unauthorized</h2>
        <p className="mt-2 text-slate-600">
          You don’t have permission to access this page.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90"
          >
            Go Home
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 hover:bg-slate-50"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
