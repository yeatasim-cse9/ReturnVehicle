// returnvehicle-frontend/src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  Map,
  Clock,
  Car,
  Truck,
  Ambulance,
  ArrowRight,
  Sparkles,
  Globe2,
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-10 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">
            About ReturnVehicle
          </h1>
          <p className="mt-2 text-white/90">
            A simple, role-based platform to post and book rides across
            Bangladesh with confidence.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Mission */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-slate-800 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Our mission
              </h2>
              <p className="mt-2 text-slate-700">
                Make intercity travel and urgent transport easier by connecting
                passengers and drivers for Ambulance, Car, and Truck rides in a
                clean, safe interface.
              </p>
            </div>
          </div>
        </section>

        {/* What we offer */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900">
            What we offer
          </h3>
          <p className="mt-1 text-slate-600">
            Multiple vehicle categories and simple tools to plan, post, and book
            quickly.
          </p>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow transition">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-slate-900">
                  Ambulance
                </h4>
                <Ambulance className="h-5 w-5 text-slate-800" />
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Critical or urgent trips with straightforward booking and
                visibility.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow transition">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-slate-900">Car</h4>
                <Car className="h-5 w-5 text-slate-800" />
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Everyday intercity rides with clear pricing and seat
                availability.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow transition">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-slate-900">
                  Truck
                </h4>
                <Truck className="h-5 w-5 text-slate-800" />
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Cargo-friendly options for moving goods between districts.
              </p>
            </article>
          </div>
        </section>

        {/* How it works */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">How it works</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900 font-medium">
                <Map className="h-4 w-4" /> Search
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Pick From/To, date, and category; filter by price and
                availability.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900 font-medium">
                <Users className="h-4 w-4" /> Post or Book
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Drivers post rides; passengers request seats with contact
                details.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900 font-medium">
                <Shield className="h-4 w-4" /> Confirm
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Driver reviews and accepts; seats update automatically.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900 font-medium">
                <Clock className="h-4 w-4" /> Manage
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Each role has a dashboard to track listings and bookings.
              </p>
            </div>
          </div>
        </section>

        {/* Role-based access */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900">
            Role-based access
          </h3>
          <p className="mt-1 text-slate-600">
            Separate dashboards for User, Driver, and Admin streamline actions
            and keep navigation clear.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-base font-semibold text-slate-900">User</h4>
              <p className="mt-1 text-sm text-slate-700">
                Search rides, request seats, and manage bookings with simple
                controls.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-base font-semibold text-slate-900">Driver</h4>
              <p className="mt-1 text-sm text-slate-700">
                Post rides, update seats and pricing, and accept or reject
                requests.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-base font-semibold text-slate-900">Admin</h4>
              <p className="mt-1 text-sm text-slate-700">
                Oversee users and rides with filtering and pagination tools.
              </p>
            </div>
          </div>
        </section>

        {/* At a glance (mirrors style seen on Home) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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

        {/* Why ReturnVehicle */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Why ReturnVehicle
          </h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900 font-medium">
                <Globe2 className="h-4 w-4" /> Bangladesh-focused
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Optimized for common intercity routes with location
                auto-complete.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900 font-medium">
                <Shield className="h-4 w-4" /> Role clarity
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Guarded endpoints and dashboards simplify what each role can do.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900 font-medium">
                <Users className="h-4 w-4" /> Clean UX
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Straightforward forms, clear statuses, and consistent visuals.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Ready to get started?
              </h3>
              <p className="mt-1 text-slate-700">
                Create an account to book or post rides, or reach out for
                details.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
