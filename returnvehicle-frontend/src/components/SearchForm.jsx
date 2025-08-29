import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AutocompleteInput from "./AutocompleteInput";

// Bangladesh mock locations (sample). পরে MongoDB থেকে ফেচ করবো।
const BD_LOCATIONS = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cox’s Bazar",
  "Comilla",
  "Gazipur",
  "Narayanganj",
  "Tangail",
  "Jessore",
  "Bogra",
  "Dinajpur",
  "Pabna",
  "Feni",
  "Noakhali",
  "Jamalpur",
  "Moulvibazar",
  "Habiganj",
];

export default function SearchForm({ compact = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: "",
    to: "",
    journeyDate: "",
    returnDate: "",
    category: "Car",
    passengers: 1,
  });

  const canSubmit = useMemo(() => {
    return (
      form.from &&
      form.to &&
      form.journeyDate &&
      form.category &&
      form.passengers > 0
    );
  }, [form]);

  const handleChange = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const params = new URLSearchParams({
      from: form.from,
      to: form.to,
      journeyDate: form.journeyDate,
      ...(form.returnDate ? { returnDate: form.returnDate } : {}),
      category: form.category,
      passengers: String(form.passengers),
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`w-full ${
        compact ? "" : "max-w-5xl mx-auto"
      } rounded-2xl bg-white shadow p-4 md:p-5`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AutocompleteInput
          label="From"
          name="from"
          value={form.from}
          onChange={(v) => handleChange("from", v)}
          locations={BD_LOCATIONS}
          placeholder="e.g., Dhaka"
        />
        <AutocompleteInput
          label="To"
          name="to"
          value={form.to}
          onChange={(v) => handleChange("to", v)}
          locations={BD_LOCATIONS}
          placeholder="e.g., Chittagong"
        />

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Journey Date
          </label>
          <input
            type="date"
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
            Passengers
          </label>
          <input
            type="number"
            min={1}
            max={8}
            value={form.passengers}
            onChange={(e) => handleChange("passengers", Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
        >
          Search
        </button>
      </div>
    </form>
  );
}
