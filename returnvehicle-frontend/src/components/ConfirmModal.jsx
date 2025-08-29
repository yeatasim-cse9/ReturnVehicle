import React from "react";

export default function ConfirmModal({
  open,
  onClose,
  title = "Booking Confirmed",
  children,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow p-5">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <div className="mt-2 text-sm text-slate-700">{children}</div>
          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
