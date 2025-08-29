import React, { useEffect, useRef, useState } from "react";
import { searchLocations } from "../services/locationsApi";

export default function AutocompleteInput({
  label,
  value,
  onChange,
  placeholder = "Type a location",
  required = false,
  name,
}) {
  const [q, setQ] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const timer = useRef(null);
  const wrapRef = useRef(null);

  // keep local q in sync if parent value changes
  useEffect(() => {
    setQ(value || "");
  }, [value]);

  // outside click close
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const runSearch = async (text) => {
    if (!text.trim()) {
      setItems([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const list = await searchLocations(text, 8);
      setItems(list);
      setOpen(true);
    } catch (e) {
      setError("Failed to fetch locations");
      setItems([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const onInput = (val) => {
    setQ(val);
    onChange?.(val); // reflect to parent immediately (so value visible)
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSearch(val), 200); // debounce 200ms
  };

  const select = (val) => {
    onChange?.(val);
    setQ(val);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      {label ? (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        name={name}
        type="text"
        value={q}
        onChange={(e) => onInput(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      {open && (items.length > 0 || loading || error) && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-3 py-2 text-sm text-slate-600">Searching…</div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-red-600">{error}</div>
          ) : (
            <ul className="max-h-56 overflow-auto py-1">
              {items.map((it) => (
                <li
                  key={it}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(it)}
                  className="px-3 py-2 text-sm text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  {it}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
