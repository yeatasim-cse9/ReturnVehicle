import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function RideCard({ ride }) {
  const [broken, setBroken] = useState(false);
  const jd = ride?.journeyDate
    ? new Date(ride.journeyDate).toISOString().slice(0, 10)
    : "—";
  const rd = ride?.returnDate
    ? new Date(ride.returnDate).toISOString().slice(0, 10)
    : null;
  const soldOut =
    typeof ride?.availableSeats === "number" && ride.availableSeats <= 0;

  // Format date for better display
  const formatDate = (dateString) => {
    if (dateString === "—") return dateString;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="group relative bg-white rounded-3xl shadow-sm border border-slate-100/50 overflow-hidden hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 ease-out">
      {/* Image Container with Overlay Elements */}
      <div className="relative overflow-hidden">
        {ride?.imageUrl && !broken ? (
          <img
            src={ride.imageUrl}
            alt={`${ride.from} to ${ride.to}`}
            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-slate-400 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-slate-500 font-medium">
                Vehicle Image
              </p>
            </div>
          </div>
        )}

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Category Badge - Top Right */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-800 shadow-lg">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            {ride.category}
          </span>
        </div>

        {/* Availability Badge - Top Left */}
        {soldOut && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/90 backdrop-blur-sm text-white shadow-lg">
              <svg
                className="w-3 h-3 mr-1.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Route Information */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {ride.from}
            </h3>
            <div className="flex-1 flex items-center justify-center px-2">
              <div className="w-full max-w-20 h-px bg-slate-300 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {ride.to}
            </h3>
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <svg
              className="w-4 h-4 mr-1.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">
              {ride.vehicleModel || "Standard Vehicle"}
            </span>
          </div>
        </div>

        {/* Date Information */}
        <div className="mb-4 p-3 bg-slate-50/80 rounded-xl">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-semibold text-slate-700">Departure:</span>
              <span className="text-slate-600">{formatDate(jd)}</span>
            </div>
            {rd && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                <span className="font-semibold text-slate-700">Return:</span>
                <span className="text-slate-600">{formatDate(rd)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price and Availability */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              ৳{ride.price}
            </span>
            <span className="text-sm text-slate-500">/person</span>
          </div>

          {!soldOut ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-emerald-700">
                {ride.availableSeats ?? "—"}/{ride.totalSeats ?? "—"} seats
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg">
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold text-red-700">
                Seats Unavailable
              </span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link
          to={`/booking/${ride._id}`}
          className={`group relative w-full inline-flex items-center justify-center px-6 py-4 rounded-2xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl ${
            soldOut
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 hover:scale-[1.02] active:scale-[0.98]"
          }`}
          {...(soldOut && { onClick: (e) => e.preventDefault() })}
        >
          <span className="flex items-center gap-3">
            {soldOut ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Unavailable
              </>
            ) : (
              <>
                View Details
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </>
            )}
          </span>
        </Link>
      </div>
    </div>
  );
}
