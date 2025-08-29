import React, { useMemo, useState } from "react";
import AutocompleteInput from "./AutocompleteInput";
import { toast } from "react-hot-toast";
import { postRide } from "../services/ridesApi";

/**
 * props:
 *  - onCreate(ride) => parent list-এ add করবে
 */
export default function PostRideForm({ onCreate }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    from: "",
    to: "",
    journeyDate: "",
    returnDate: "",
    category: "Car",
    price: "",
    vehicleModel: "",
    totalSeats: 4,
    availableSeats: 4,
    imageFile: null,
    imagePreview: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (!form.from || !form.to || !form.journeyDate || !form.category)
      return false;
    if (!form.price || Number(form.price) <= 0) return false;
    if (!form.vehicleModel) return false;
    if (Number(form.totalSeats) < 1) return false;
    if (
      Number(form.availableSeats) < 0 ||
      Number(form.availableSeats) > Number(form.totalSeats)
    )
      return false;
    if (form.returnDate && form.returnDate < form.journeyDate) return false;
    return true;
  }, [form]);

  const handleChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const onImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setForm((p) => ({ ...p, imageFile: null, imagePreview: null }));
      return;
    }
    const url = URL.createObjectURL(file);
    setForm((p) => ({ ...p, imageFile: file, imagePreview: url }));
  };

  const reset = () => {
    setForm({
      from: "",
      to: "",
      journeyDate: "",
      returnDate: "",
      category: "Car",
      price: "",
      vehicleModel: "",
      totalSeats: 4,
      availableSeats: 4,
      imageFile: null,
      imagePreview: null,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    const payload = {
      from: form.from,
      to: form.to,
      journeyDate: form.journeyDate,
      returnDate: form.returnDate || null,
      category: form.category,
      price: Number(form.price),
      vehicleModel: form.vehicleModel,
      totalSeats: Number(form.totalSeats),
      availableSeats: Number(form.availableSeats),
      imageUrl: null, // ImageKit later
    };

    try {
      setSubmitting(true);
      const created = await postRide(payload);
      toast.success("Ride posted");
      onCreate?.(created); // backend থেকে ফেরত আসা রাইড parent list-এ দিন
      reset();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to post ride";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <h3 className="text-lg font-semibold text-slate-900">Post New Ride</h3>
      <p className="mt-1 text-sm text-slate-600">
        Fill in the details and publish your ride.
      </p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <AutocompleteInput
          label="From"
          name="from"
          value={form.from}
          onChange={(v) => handleChange("from", v)}
          placeholder="e.g., Dhaka"
        />
        <AutocompleteInput
          label="To"
          name="to"
          value={form.to}
          onChange={(v) => handleChange("to", v)}
          placeholder="e.g., Chattogram"
        />

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Journey Date
          </label>
          <input
            type="date"
            min={today}
            value={form.journeyDate}
            onChange={(e) => handleChange("journeyDate", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Return Date (optional)
          </label>
          <input
            type="date"
            min={form.journeyDate || today}
            value={form.returnDate}
            onChange={(e) => handleChange("returnDate", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option>Ambulance</option>
            <option>Car</option>
            <option>Truck</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Price (৳)
          </label>
          <input
            type="number"
            min={1}
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            placeholder="e.g., 3500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Vehicle Model
          </label>
          <input
            type="text"
            value={form.vehicleModel}
            onChange={(e) => handleChange("vehicleModel", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            placeholder="e.g., Toyota Corolla"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Total Seats
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={form.totalSeats}
            onChange={(e) => handleChange("totalSeats", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Available Seats
          </label>
          <input
            type="number"
            min={0}
            max={form.totalSeats || 50}
            value={form.availableSeats}
            onChange={(e) => handleChange("availableSeats", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Vehicle Image (placeholder)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onImage}
            className="mt-1 block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 hover:file:bg-slate-50"
          />
          {form.imagePreview && (
            <div className="mt-3">
              <img
                src={form.imagePreview}
                alt="preview"
                className="h-40 w-full max-w-sm rounded-xl object-cover border border-slate-200"
              />
            </div>
          )}
          <p className="mt-1 text-xs text-slate-500">
            This is a local preview. Upload to ImageKit will be added later.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post Ride"}
        </button>
      </div>
    </form>
  );
}
