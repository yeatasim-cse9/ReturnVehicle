import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold">404 — Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          The page you’re looking for doesn’t exist.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
