import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";
import useDebouncedValue from "../hooks/useDebouncedValue";

/**
 * props:
 *  - label
 *  - name
 *  - value
 *  - onChange(value)
 *  - placeholder
 *  - locations?: string[]  // দিলে লোকাল ফিল্টার, না দিলে backend API ব্যবহৃত হবে
 */
export default function AutocompleteInput({
  label,
  name,
  value,
  onChange,
  placeholder = "Type a location",
  locations,
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [items, setItems] = useState([]); // array of {name, division}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debounced = useDebouncedValue(value, 250);
  const useBackend = !Array.isArray(locations);

  // Local filtering (fallback mode)
  const localMatches = useMemo(() => {
    if (!locations) return [];
    const q = (value || "").trim().toLowerCase();
    if (!q) return [];
    return locations
      .filter((item) => item.toLowerCase().includes(q))
      .slice(0, 8)
      .map((name) => ({ name, division: "" }));
  }, [locations, value]);

  // Backend searching
  useEffect(() => {
    if (!useBackend) return;

    const q = (debounced || "").trim();
    if (!q) {
      setItems([]);
      setLoading(false);
      setError("");
      return;
    }

    let aborted = false;
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/locations/search", {
          params: { q, limit: 8 },
          signal: controller.signal,
        });
        if (aborted) return;
        const list = (res?.data?.items || []).map((d) => ({
          name: d.name,
          division: d.division || "",
        }));
        setItems(list);
      } catch (err) {
        if (aborted) return;
        setError("Failed to load");
        setItems([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [debounced, useBackend]);

  // Which list to show
  const matches = useBackend ? items : localMatches;

  const choose = (v) => {
    onChange(v);
    setOpen(false);
    setHighlight(-1);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!matches.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = matches[highlight] || matches[0];
      if (pick) choose(pick.name);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
      />

      {open && (loading || error || matches.length > 0) && (
        <ul
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow"
          role="listbox"
        >
          {loading && (
            <li className="px-3 py-2 text-slate-600 text-sm flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              Searching…
            </li>
          )}

          {!loading && error && (
            <li className="px-3 py-2 text-slate-600 text-sm">Failed to load</li>
          )}

          {!loading && !error && matches.length === 0 && (
            <li className="px-3 py-2 text-slate-600 text-sm">No results</li>
          )}

          {!loading &&
            !error &&
            matches.map((m, idx) => (
              <li
                key={`${m.name}-${idx}`}
                role="option"
                aria-selected={highlight === idx}
                className={`px-3 py-2 cursor-pointer ${
                  highlight === idx ? "bg-slate-100" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(m.name);
                }}
                onMouseEnter={() => setHighlight(idx)}
              >
                <div className="text-slate-900">{m.name}</div>
                {m.division && (
                  <div className="text-xs text-slate-600">{m.division}</div>
                )}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
