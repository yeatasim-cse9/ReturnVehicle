import React, { useMemo, useRef, useState } from "react";

/**
 * props:
 *  - label
 *  - name
 *  - value
 *  - onChange(value)
 *  - placeholder
 *  - locations: string[] (Bangladesh places)
 */
export default function AutocompleteInput({
  label,
  name,
  value,
  onChange,
  placeholder = "Type a location",
  locations = [],
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef(null);

  const matches = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return [];
    return locations
      .filter((item) => item.toLowerCase().includes(q))
      .slice(0, 8);
  }, [value, locations]);

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
      if (pick) choose(pick);
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

      {open && matches.length > 0 && (
        <ul
          ref={boxRef}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow"
          role="listbox"
        >
          {matches.map((m, idx) => (
            <li
              key={m}
              role="option"
              aria-selected={highlight === idx}
              className={`px-3 py-2 cursor-pointer text-slate-800 ${
                highlight === idx ? "bg-slate-100" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(m);
              }}
              onMouseEnter={() => setHighlight(idx)}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
