import React from "react";
import heroUrl from "../assets/hero.jpg";
import { Link } from "react-router-dom";
import SearchForm from "../components/SearchForm";
import SectionTitle from "../components/SectionTitle";
import FeatureCard from "../components/FeatureCard";
import FeaturedRides from "../components/FeaturedRides";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[60vh]">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${heroUrl})` }}
          aria-hidden="true"
        />
        {/* subtle overlay for readability */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/20"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="max-w-3xl">
              <span className="inline-block text-xs md:text-sm font-medium tracking-wide uppercase text-white/80 bg-white/10 backdrop-blur px-3 py-1 rounded-full">
                Bangladesh • Ambulance • Car • Truck
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-bold text-white leading-tight">
                Share rides across Bangladesh with confidence
              </h1>
              <p className="mt-3 md:mt-4 text-white/90">
                Book one-way or return rides, compare options, and travel
                together—fast, simple, and secure.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Link
                  to="/driver/dashboard"
                  className="px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100"
                >
                  Become a Driver
                </Link>
                <Link
                  to="/about"
                  className="px-5 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/30"
                >
                  Learn more
                </Link>
              </div>
            </div>

            {/* search form sits under hero text on larger screens */}
            <div className="mt-8 md:mt-12">
              <div className="max-w-5xl">
                <SearchForm />
              </div>
            </div>
          </div>
        </div>

        {/* subtle bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"
          aria-hidden="true"
        />
      </section>

      {/* STATS STRIP */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-slate-900">3</p>
            <p className="text-slate-600 text-sm">Vehicle categories</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">64+</p>
            <p className="text-slate-600 text-sm">District routes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">24/7</p>
            <p className="text-slate-600 text-sm">Search & book</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">Return</p>
            <p className="text-slate-600 text-sm">Round-trip options</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <SectionTitle
          eyebrow="Why ReturnVehicle"
          title="Plan, post, and book in minutes"
          subtitle="From emergency ambulances to daily car shares and trucks—find the right ride for your route."
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Smart search"
            desc="Auto-complete for Bangladesh locations plus filters for category, date, and seats."
          />
          <FeatureCard
            title="Driver-friendly"
            desc="Post rides, manage requests, and keep track of your trips from a simple dashboard."
          />
          <FeatureCard
            title="Role-based access"
            desc="User, Driver, and Admin dashboards with clean navigation and secure access."
          />
        </div>
      </section>

      {/* FEATURED RIDES (placeholder, backend later) */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <SectionTitle
            eyebrow="Popular right now"
            title="Featured rides"
            subtitle="Sample cards for layout preview. Real data will load after backend integration."
          />
          <div className="mt-8">
            <FeaturedRides />
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            Ready to roll across Bangladesh?
          </h3>
          <p className="mt-2 text-white/90">
            Create your account and start booking or posting rides today.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100"
            >
              Get started
            </Link>
            <Link
              to="/contact"
              className="px-5 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
