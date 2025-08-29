import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRideById } from "../services/ridesApi";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { createBooking } from "../services/bookingsApi";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}

function formatDate(d) {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    seats: 1,
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const r = await getRideById(id);
        if (!mounted) return;
        setRide(r);
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message || err?.message || "Failed to load ride"
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

  const seatUnavailable = useMemo(() => {
    if (!ride) return false;
    return Number(form.seats) > Number(ride.availableSeats);
  }, [form.seats, ride]);

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!ride) return;
    if (seatUnavailable) return toast.error("Seat is not Available");

    // Require auth + role user
    if (!user) {
      toast.error("Please login to book");
      return navigate("/login");
    }
    if (role && role !== "user") {
      return toast.error("Only user accounts can book rides");
    }

    if (!form.fullName.trim() || !/^\+?[0-9\- ]{8,}$/.test(form.phone.trim())) {
      return toast.error("Please enter valid name & phone");
    }

    try {
      setSubmitting(true);
      // ✅ Backend booking call
      await createBooking({
        rideId: ride._id,
        seats: Number(form.seats),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        note: form.note.trim(),
      });
      // Success
      setOpenModal(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Booking failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Spinner label="Loading ride..." />
      </div>
    );
  }
  if (error || !ride) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-slate-700">{error || "Not found"}</p>
      </div>
    );
  }

  const total = Number(form.seats || 0) * Number(ride.price || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Booking</h2>
      <p className="mt-1 text-slate-600 text-sm">
        Review the ride details and confirm your booking.
      </p>

      {/* Ride details */}
      <section className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {ride.from} → {ride.to}
            </h3>
            <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
              {ride.category}
            </span>
          </div>
          <p className="mt-1 text-slate-600 text-sm">
            Journey: {formatDate(ride.journeyDate)}
            {ride.returnDate ? ` • Return: ${formatDate(ride.returnDate)}` : ""}
          </p>
          <p className="mt-1 text-slate-600 text-sm">
            Vehicle: {ride.vehicleModel} • Seats: {ride.availableSeats}/
            {ride.totalSeats}
          </p>
          <p className="mt-2 text-slate-900 font-semibold">
            ৳ {ride.price} per seat
          </p>

          {ride.imageUrl && (
            <img
              src={ride.imageUrl}
              alt="vehicle"
              className="mt-3 h-48 w-full rounded-xl object-cover border border-slate-200"
            />
          )}
        </div>

        {/* Fare Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h4 className="text-base font-semibold text-slate-900">
            Fare Summary
          </h4>
          <dl className="mt-2 text-sm text-slate-700 space-y-1">
            <div className="flex justify-between">
              <dt>Price (per seat)</dt>
              <dd>৳ {ride.price}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Seats</dt>
              <dd>{form.seats}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
              <dt>Total</dt>
              <dd>৳ {total}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Booking form */}
      <form
        onSubmit={onSubmit}
        className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"
      >
        <h4 className="text-base font-semibold text-slate-900">
          Passenger Details
        </h4>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="e.g., 01XXXXXXXXX"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Seats
            </label>
            <input
              type="number"
              min={1}
              max={ride.availableSeats || 1}
              value={form.seats}
              onChange={(e) => handleChange("seats", Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            {seatUnavailable && (
              <p className="mt-1 text-xs text-slate-700">
                Seat is not Available
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Note (optional)
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Any special note"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={submitting || seatUnavailable}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Booking…" : "Confirm Booking"}
          </button>
        </div>
      </form>

      {/* Confirm Modal */}
      <ConfirmModal open={openModal} onClose={() => setOpenModal(false)}>
        <p>
          <span className="font-semibold">Booking Confirmed.</span> Payment
          placeholder (Stripe/SSLCommerz).
          <br />
          Your booking has been recorded.
        </p>
      </ConfirmModal>
    </div>
  );
}
