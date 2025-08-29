import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { createRide } from "../services/ridesApi";
import { uploadImage, deleteImage } from "../services/uploadsApi";
import AutocompleteInput from "./AutocompleteInput";

function Spinner({ label = "Processing..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}

export default function PostRideForm({ onCreate }) {
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
    imageUrl: "", // ImageKit URL (will be set on submit if file chosen)
  });

  // ⬇️ image নির্বাচন (লোকাল প্রিভিউ) — আপলোড নয়
  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [tooBig, setTooBig] = useState(false);

  // সাবমিট স্টেট
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // --------- Derived validation ----------
  const numPrice = Number(form.price);
  const numTotal = Number(form.totalSeats);
  const numAvail = Number(form.availableSeats);

  const errors = useMemo(() => {
    const e = {};
    if (!form.from.trim()) e.from = "Required";
    if (!form.to.trim()) e.to = "Required";
    if (!form.journeyDate) e.journeyDate = "Required";
    if (!["Ambulance", "Car", "Truck"].includes(form.category))
      e.category = "Invalid category";
    if (!form.price || Number.isNaN(numPrice) || numPrice <= 0)
      if (!numTotal || numTotal < 1) e.totalSeats = "At least 1 seat";
    if (numAvail < 0) e.availableSeats = "Cannot be negative";
    if (numAvail > numTotal) e.availableSeats = "Cannot exceed total seats";
    if (form.returnDate) {
      const jd = new Date(form.journeyDate);
      const rd = new Date(form.returnDate);
      if (rd < jd) e.returnDate = "Return cannot be before journey";
    }
    return e;
  }, [form, numPrice, numTotal, numAvail]);

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);

  // --------- File pick (preview only, no upload) ----------
  const onFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const big = file.size > 5 * 1024 * 1024;
    setTooBig(big);
    if (big) {
      toast.error("Max 5MB image allowed");
    }
    setPickedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    // পুরনো আপলোড URL থাকলে ক্লিয়ার করুন
    if (form.imageUrl) onChange("imageUrl", "");
    setUploadProgress(0);
  };

  const resetForm = () => {
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
      imageUrl: "",
    });
    setPickedFile(null);
    setPreviewUrl("");
    setTooBig(false);
    setUploadProgress(0);
  };

  // --------- Submit (upload image now → then create ride) ----------
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    if (tooBig) {
      toast.error("Selected image is larger than 5MB");
      return;
    }

    setSubmitting(true);
    let uploadedNow = null; // {fileId, url}
    try {
      // 1) যদি ইমেজ সিলেক্ট করা থাকে এবং এখনো imageUrl সেট হয়নি → আগে আপলোড
      if (pickedFile && !form.imageUrl) {
        const res = await uploadImage(pickedFile, (p) => setUploadProgress(p));
        uploadedNow = { fileId: res.fileId, url: res.url };
      }

      // 2) Ride create
      const payload = {
        from: form.from.trim(),
        to: form.to.trim(),
        journeyDate: form.journeyDate,
        returnDate: form.returnDate || null,
        category: form.category,
        price: Number(numPrice),
        vehicleModel: form.vehicleModel.trim(),
        totalSeats: Number(numTotal),
        availableSeats: Number(numAvail),
        imageUrl: uploadedNow?.url || form.imageUrl || null,
      };

      const ride = await createRide(payload);
      toast.success("Ride posted");

      // success: reset
      resetForm();
      onCreate?.(ride);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to create ride";
      toast.error(msg);

      // যদি আপলোড হলো কিন্তু ride তৈরি হলো না → ImageKit থেকে মুছে দিন (best-effort)
      if (uploadedNow?.fileId) {
        try {
          await deleteImage(uploadedNow.fileId);
        } catch {}
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <h3 className="text-xl font-bold text-slate-900">Post New Ride</h3>
      <p className="mt-1 text-slate-600 text-sm">
        Image will be uploaded{" "}
        <strong className="text-slate-900">on Publish</strong>, not earlier.
      </p>

      {/* ---------- Section: Route & Dates ---------- */}
      <div className="mt-5">
        <h4 className="text-base font-semibold text-slate-900">
          Route & Dates
        </h4>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <AutocompleteInput
              label="From (Start location)"
              value={form.from}
              onChange={(v) => onChange("from", v)}
              placeholder="e.g., Dhaka"
              required
              name="from"
            />
            {errors.from && (
              <p className="mt-1 text-xs text-red-600">{errors.from}</p>
            )}
          </div>
          <div>
            <AutocompleteInput
              label="To (Destination)"
              value={form.to}
              onChange={(v) => onChange("to", v)}
              placeholder="e.g., Sylhet"
              required
              name="to"
            />
            {errors.to && (
              <p className="mt-1 text-xs text-red-600">{errors.to}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Journey Date
            </label>
            <input
              type="date"
              value={form.journeyDate}
              onChange={(e) => onChange("journeyDate", e.target.value)}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                errors.journeyDate ? "border-red-500" : "border-slate-300"
              }`}
              required
            />
            {errors.journeyDate && (
              <p className="mt-1 text-xs text-red-600">{errors.journeyDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Return Date (optional)
            </label>
            <input
              type="date"
              value={form.returnDate}
              onChange={(e) => onChange("returnDate", e.target.value)}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                errors.returnDate ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.returnDate && (
              <p className="mt-1 text-xs text-red-600">{errors.returnDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Section: Vehicle Details ---------- */}
      <div className="mt-6">
        <h4 className="text-base font-semibold text-slate-900">
          Vehicle Details
        </h4>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => onChange("category", e.target.value)}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                errors.category ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="Ambulance">Ambulance</option>
              <option value="Car">Car</option>
              <option value="Truck">Truck</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Vehicle Model
            </label>
            <input
              type="text"
              value={form.vehicleModel}
              onChange={(e) => onChange("vehicleModel", e.target.value)}
              placeholder="e.g., Toyota Axio 2017"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>
        </div>
      </div>

      {/* ---------- Section: Seats & Pricing ---------- */}
      <div className="mt-6">
        <h4 className="text-base font-semibold text-slate-900">
          Seats & Pricing
        </h4>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Total Seats
            </label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              step={1}
              value={form.totalSeats}
              onChange={(e) => onChange("totalSeats", Number(e.target.value))}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                errors.totalSeats ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.totalSeats && (
              <p className="mt-1 text-xs text-red-600">{errors.totalSeats}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Available Seats
            </label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              max={form.totalSeats || 1}
              step={1}
              value={form.availableSeats}
              onChange={(e) =>
                onChange("availableSeats", Number(e.target.value))
              }
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                errors.availableSeats ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.availableSeats && (
              <p className="mt-1 text-xs text-red-600">
                {errors.availableSeats}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Price (per seat) — টাকা (BDT)
            </label>
            <div
              className={`mt-1 flex items-center rounded-xl border bg-white focus-within:ring-2 focus-within:ring-slate-400 ${
                errors.price ? "border-red-500" : "border-slate-300"
              }`}
            >
              <span className="px-3 py-2 text-slate-700">৳</span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                step={1}
                value={form.price}
                onChange={(e) => onChange("price", e.target.value)}
                placeholder="e.g., 1500"
                className="w-full rounded-r-xl bg-transparent px-3 py-2 text-slate-900 outline-none"
                required
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-xs text-red-600">{errors.price}</p>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Section: Vehicle Image (preview only; upload on submit) ---------- */}
      <div className="mt-6">
        <h4 className="text-base font-semibold text-slate-900">
          Vehicle Image
        </h4>
        <div className="mt-3 rounded-2xl border border-slate-300 p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={onFilePick}
              className="block text-sm text-slate-700"
            />
            {submitting && pickedFile && !form.imageUrl && (
              <div className="flex items-center gap-2">
                <Spinner
                  label={
                    uploadProgress > 0
                      ? `Uploading image… ${uploadProgress}%`
                      : "Uploading image…"
                  }
                />
              </div>
            )}
          </div>

          {/* Preview (local) */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="vehicle preview"
              className="mt-3 h-40 w-full rounded-xl object-cover border border-slate-200"
              loading="lazy"
            />
          ) : form.imageUrl ? (
            <img
              src={form.imageUrl}
              alt="vehicle"
              className="mt-3 h-40 w-full rounded-xl object-cover border border-slate-200"
              loading="lazy"
            />
          ) : (
            <div className="mt-3 h-40 w-full rounded-xl border border-dashed border-slate-300 text-slate-500 flex items-center justify-center text-sm">
              No image selected
            </div>
          )}

          {tooBig && (
            <p className="mt-2 text-sm text-red-600">
              Selected image is larger than 5MB. Please choose a smaller file.
            </p>
          )}
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="reset"
          onClick={resetForm}
          className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
          disabled={submitting}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={!canSubmit || submitting || tooBig}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Publishing…" : "Publish Ride"}
        </button>
      </div>
    </form>
  );
}
