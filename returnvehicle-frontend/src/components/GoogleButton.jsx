import React from "react";
import { useAuth } from "../context/AuthContext";
import { googleProvider } from "../lib/firebase";

export default function GoogleButton({ label = "Continue with Google" }) {
  const { loginGoogle } = useAuth();

  const handleGoogle = async () => {
    await loginGoogle(googleProvider);
  };

  return (
    <button
      onClick={handleGoogle}
      className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800 hover:bg-slate-50 transition"
      aria-label={label}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="h-5 w-5"
      >
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 31.7 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.4 7.1 28.9 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.5-.2-3-.4-4.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.5 16.4 18.8 13 24 13c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.4 7.1 28.9 5 24 5 15.2 5 7.9 10.2 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 45c4.9 0 9.4-1.9 12.8-5.1l-5.9-4.8C29.1 36.8 26.7 38 24 38c-5.2 0-9.6-3.4-11.1-8.1L6.3 34C7.9 38.8 15.2 45 24 45z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.7-5.7 7-11.3 7-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.4 7.1 28.9 5 24 5c-11.1 0-20 8.9-20 20s8.9 20 20 20 20-8.9 20-20c0-1.5-.2-3-.4-4.5z"
        />
      </svg>
      <span className="font-medium">{label}</span>
    </button>
  );
}
