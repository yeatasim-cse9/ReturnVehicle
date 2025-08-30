// returnvehicle-frontend/src/pages/Booking.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getRideById } from "../services/ridesApi";
import { createBooking } from "../services/bookingsApi";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}

function fmt(d) {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [passengers, setPassengers] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showOk, setShowOk] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setErr("");
      try {
        const data = await getRideById(id);
        if (!mounted) return;
        setRide(data);
        setPassengers(data?.availableSeats > 0 ? 1 : 0);
      } catch (e) {
        if (!mounted) return;
        setErr(
          e?.response?.data?.message || e?.message || "Failed to load ride"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!ride?._id) return toast.error("Ride not found");

    const pax = Number(passengers || 0);
    if (!(pax >= 1)) return toast.error("Select at least 1 seat");
    if (ride.availableSeats != null && pax > ride.availableSeats) {
      return toast.error("Requested seats exceed available seats");
    }
    if (!contactName.trim()) return toast.error("Enter passenger name");
    if (!/^\d{6,15}$/.test(contactPhone.trim())) {
      return toast.error("Enter a valid phone (digits only, 6-15)");
    }

    try {
      setSubmitting(true);
      await createBooking(ride._id, {
        passengers: pax,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
      });
      setShowOk(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Booking failed";
      if (/Seat is not Available/i.test(msg)) {
        toast.error("Seat is not Available");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowOk(false);
    navigate("/user/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">
        Confirm Your Booking
      </h2>
      <p className="text-slate-600 mb-6">
        Please review ride details and complete your passenger information.
      </p>

      {loading ? (
        <div className="mt-6">
          <Spinner label="Loading ride..." />
        </div>
      ) : err ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-700">{err}</p>
          <Link
            to="/"
            className="mt-3 inline-block px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>
      ) : !ride ? (
        <p className="mt-6 text-slate-600">Ride not found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Ride Summary */}
          <aside className="md:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                {ride.from} → {ride.to}
              </h3>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                {ride.journeyDate && (
                  <p>
                    <strong>Journey:</strong> {fmt(ride.journeyDate)}
                  </p>
                )}
                {ride.returnDate && (
                  <p>
                    <strong>Return:</strong> {fmt(ride.returnDate)}
                  </p>
                )}
                <p>
                  <strong>Category:</strong> {ride.category}
                </p>
                <p>
                  <strong>Vehicle:</strong> {ride.vehicleModel}
                </p>
                <p>
                  <strong>Price:</strong> ৳ {ride.price} / seat
                </p>
                <p>
                  <strong>Seats available:</strong> {ride.availableSeats ?? "—"}
                  /{ride.totalSeats ?? "—"}
                </p>
              </div>
              {ride.imageUrl && (
                <img
                  src={ride.imageUrl}
                  alt="vehicle"
                  className="mt-4 h-40 w-full rounded-xl object-cover border border-slate-200"
                />
              )}
            </div>
          </aside>

          {/* Booking Form */}
          <section className="md:col-span-3">
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Passenger Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-shadow"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-shadow"
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700">Seats</label>
                  <input
                    type="number"
                    min={1}
                    max={ride.availableSeats || 50}
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-shadow"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-600">
                    Max {ride.availableSeats || 0} seats available
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting || (ride.availableSeats || 0) < 1}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60 transition-all"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Booking…
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
                <Link
                  to="/search"
                  className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                >
                  Back to Search
                </Link>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Success Modal */}
      {showOk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl animate-fade-in">
            <div className="flex justify-center mb-3">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-slate-900">
              Booking Confirmed
            </h4>
            <p className="mt-2 text-slate-700">
              Your booking is placed and pending driver confirmation.
            </p>
            <div className="mt-4">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90"
              >
                Go to My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
