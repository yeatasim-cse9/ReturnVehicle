import React from "react";

export default function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {eyebrow && (
        <span className="inline-block text-xs font-medium tracking-wide uppercase text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
          {title}
        </h2>
      )}
      {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
    </div>
  );
}
