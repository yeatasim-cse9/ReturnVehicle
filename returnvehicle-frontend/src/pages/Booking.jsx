// returnvehicle-frontend/src/pages/Booking.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getRideById } from "../services/ridesApi";
import { createBooking } from "../services/bookingsApi";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="inline-flex items-center gap-2 text-slate-600 text-sm">
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
  const { id } = useParams(); // /booking/:id
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form state
  const [passengers, setPassengers] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showOk, setShowOk] = useState(false);

  // price calc
  const total = useMemo(() => {
    const p = Number(passengers || 0);
    const price = Number(ride?.price || 0);
    return p > 0 && price > 0 ? p * price : 0;
  }, [passengers, ride]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setErr("");
      try {
        const data = await getRideById(id);
        if (!mounted) return;
        setRide(data || null);
        if ((data?.availableSeats ?? 0) > 0) {
          setPassengers(1);
        } else {
          setPassengers(0);
        }
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
      } else if (/Unauthorized|401/i.test(msg)) {
        toast.error("Please log in to book.");
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
    <div className="min-h-[70vh] bg-slate-50">
      {/* Header Bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/search"
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
            >
              ← Back
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Book your ride
            </h1>
          </div>
          <div className="hidden md:block text-sm text-slate-600">
            Secure & quick booking
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Spinner label="Loading ride..." />
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-slate-700">{err}</p>
            <Link
              to="/"
              className="mt-3 inline-block px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
            >
              Back to Home
            </Link>
          </div>
        ) : !ride ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-slate-700">Ride not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Ride Card */}
            <aside className="lg:col-span-1">
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {/* Top banner */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-4 text-white">
                  <div className="text-sm opacity-90">Route</div>
                  <div className="text-lg font-semibold">
                    {ride.from} → {ride.to}
                  </div>
                </div>

                {/* Image */}
                {ride.imageUrl ? (
                  <img
                    src={ride.imageUrl}
                    alt="vehicle"
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="h-44 w-full bg-slate-100 flex items-center justify-center text-slate-500">
                    No image
                  </div>
                )}

                {/* Info */}
                <div className="p-5 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                      {ride.category}
                    </span>
                    <span className="inline-flex items-center text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                      ৳ {ride.price}/seat
                    </span>
                    <span className="inline-flex items-center text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                      Seats: {ride.availableSeats ?? "—"}/
                      {ride.totalSeats ?? "—"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700">
                    {ride.journeyDate ? (
                      <>
                        <span className="text-slate-900 font-medium">
                          Journey:
                        </span>{" "}
                        {fmt(ride.journeyDate)}
                      </>
                    ) : null}
                    {ride.returnDate ? (
                      <>
                        {" "}
                        •{" "}
                        <span className="text-slate-900 font-medium">
                          Return:
                        </span>{" "}
                        {fmt(ride.returnDate)}
                      </>
                    ) : null}
                  </p>

                  <p className="text-sm text-slate-700">
                    <span className="text-slate-900 font-medium">Vehicle:</span>{" "}
                    {ride.vehicleModel}
                  </p>
                </div>
              </div>

              {/* Sticky price summary */}
              <div className="mt-6 lg:mt-8 lg:sticky lg:top-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h4 className="text-base font-semibold text-slate-900">
                    Price summary
                  </h4>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Per seat</span>
                      <span className="text-slate-900">৳ {ride.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Seats</span>
                      <span className="text-slate-900">{passengers || 0}</span>
                    </div>
                    <hr className="my-2 border-slate-200" />
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span className="text-slate-900">Total</span>
                      <span className="text-slate-900">৳ {total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right: Form */}
            <section className="lg:col-span-2">
              <form
                onSubmit={onSubmit}
                className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                    Passenger details
                  </h3>
                  {ride.availableSeats > 0 ? (
                    <span className="inline-flex items-center text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                      {ride.availableSeats} seats available
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                      Seat is not Available
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700">Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700">
                      Seats
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={ride.availableSeats || 50}
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-600">
                      Max {ride.availableSeats || 0} seats available
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting || (ride.availableSeats || 0) < 1}
                    className="px-5 py-3 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? "Booking…" : "Confirm Booking"}
                  </button>
                  <Link
                    to="/search"
                    className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 text-center"
                  >
                    Back to Search
                  </Link>
                </div>
              </form>

              {/* Helpful note */}
              <div className="mt-4 text-sm text-slate-600">
                After you confirm, your booking will be{" "}
                <span className="text-slate-900 font-medium">pending</span>{" "}
                until the driver accepts. You can manage/cancel it from{" "}
                <Link to="/user/dashboard" className="underline">
                  My Bookings
                </Link>
                .
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showOk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-xl text-slate-900">✓</span>
            </div>
            <h4 className="mt-3 text-xl font-semibold text-slate-900">
              Booking Confirmed
            </h4>
            <p className="mt-2 text-slate-700">
              Your booking is placed. We’ll notify you when the driver accepts.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90"
              >
                Go to My Bookings
              </button>
              <button
                onClick={() => setShowOk(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
              >
                Stay here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
