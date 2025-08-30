// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { adminListUsers, adminListRides } from "../services/adminApi";

// নতুন কম্পোনেন্টগুলো ইম্পোর্ট করুন
import StatCard from "../components/admin/StatCard";
import UsersPanel from "../components/admin/UsersPanel";
import RidesPanel from "../components/admin/RidesPanel";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users"); // 'users' | 'rides'

  // Stat Cards এর জন্য state
  const [stats, setStats] = useState({ users: 0, rides: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch data for stat cards
  useEffect(() => {
    async function fetchStats() {
      try {
        setStatsLoading(true);
        // Promise.all দিয়ে একসাথে দুটি API কল করা হচ্ছে
        const [usersData, ridesData] = await Promise.all([
          adminListUsers({ limit: 1 }),
          adminListRides({ limit: 1 }),
        ]);
        setStats({
          users: usersData.total || 0,
          rides: ridesData.total || 0,
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
      <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
      <p className="mt-1 text-slate-600">
        Welcome back, Admin! Manage your platform from here.
      </p>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users}
          loading={statsLoading}
        />
        <StatCard
          title="Total Rides"
          value={stats.rides}
          loading={statsLoading}
        />
        <StatCard
          title="Bookings"
          value="N/A"
          loading={statsLoading}
          isComingSoon={true}
        />
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-slate-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setTab("users")}
            className={`px-3 py-2 font-medium text-sm rounded-t-lg ${
              tab === "users"
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setTab("rides")}
            className={`px-3 py-2 font-medium text-sm rounded-t-lg ${
              tab === "rides"
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Manage Rides
          </button>
        </nav>
      </div>

      {/* Content Panels */}
      <div className="mt-6">
        {tab === "users" && <UsersPanel />}
        {tab === "rides" && <RidesPanel />}
      </div>
    </div>
  );
}
