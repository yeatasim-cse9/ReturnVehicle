import React from "react";
import heroUrl from "../assets/hero.jpg";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="relative min-h-[70vh]">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${heroUrl})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-900/30"
        aria-hidden="true"
      />
      <div className="relative z-10 grid min-h-[70vh] place-items-center px-4">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Share rides across Bangladesh
          </h1>
          <p className="mt-3 text-white/90">
            Ambulance • Car • Truck — book and ride safely with return options.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/search"
              className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:opacity-90"
            >
              Start Searching
            </Link>
            <Link
              to="/driver/dashboard"
              className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100"
            >
              Become a Driver
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
