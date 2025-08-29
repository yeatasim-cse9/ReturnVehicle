import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("users"); // 'users' | 'rides' | 'reports'
  const [loading, setLoading] = useState(false);

  // --- Dummy data (backend ready wiring later) ---
  const [users, setUsers] = useState([
    // { id:'u1', name:'Akash', email:'a@ex.com', role:'driver', status:'pending'|'approved'|'blocked' }
  ]);
  const [rides, setRides] = useState([
    // { id:'r1', from:'Dhaka', to:'Sylhet', date:'2025-09-01', driver:'u1', status:'available' }
  ]);

  // search/filter
  const [query, setQuery] = useState("");

  // load sample data (mock) to visualize UI
  const loadSamples = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers([
        {
          id: "u1",
          name: "Akash",
          email: "akash@example.com",
          role: "driver",
          status: "pending",
        },
        {
          id: "u2",
          name: "Mitu",
          email: "mitu@example.com",
          role: "user",
          status: "approved",
        },
        {
          id: "u3",
          name: "Admin",
          email: "admin@example.com",
          role: "admin",
          status: "approved",
        },
        {
          id: "u4",
          name: "Rafi",
          email: "rafi@example.com",
          role: "driver",
          status: "blocked",
        },
      ]);
      setRides([
        {
          id: "r1",
          from: "Dhaka",
          to: "Chattogram",
          date: "2025-09-03",
          driver: "Akash",
          status: "available",
          price: 1500,
        },
        {
          id: "r2",
          from: "Sylhet",
          to: "Dhaka",
          date: "2025-09-10",
          driver: "Akash",
          status: "unavailable",
          price: 1400,
        },
        {
          id: "r3",
          from: "Rajshahi",
          to: "Khulna",
          date: "2025-09-05",
          driver: "Rafi",
          status: "available",
          price: 2200,
        },
      ]);
      setLoading(false);
      toast.success("Loaded sample data");
    }, 400);
  };

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q)
    );
  }, [users, query]);

  const filteredRides = useMemo(() => {
    if (!query.trim()) return rides;
    const q = query.toLowerCase();
    return rides.filter(
      (r) =>
        r.from.toLowerCase().includes(q) ||
        r.to.toLowerCase().includes(q) ||
        r.driver.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [rides, query]);

  // --- Admin actions (frontend-only now) ---
  const approveUser = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "approved" } : u))
    );
    toast.success("User approved (mock)");
  };
  const blockUser = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "blocked" } : u))
    );
    toast.success("User blocked (mock)");
  };
  const deleteRide = (id) => {
    setRides((prev) => prev.filter((r) => r.id !== id));
    toast.success("Ride deleted (mock)");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
          <p className="mt-1 text-slate-600 text-sm">
            Manage users, rides, and view reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users/rides"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            type="button"
            onClick={loadSamples}
            className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
          >
            Load samples
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-slate-200">
        <nav className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-t-xl ${
              tab === "users"
                ? "bg-white border border-b-0 border-slate-200 text-slate-900"
                : "bg-slate-50 text-slate-700"
            }`}
            onClick={() => setTab("users")}
          >
            Users
          </button>
          <button
            className={`px-4 py-2 rounded-t-xl ${
              tab === "rides"
                ? "bg-white border border-b-0 border-slate-200 text-slate-900"
                : "bg-slate-50 text-slate-700"
            }`}
            onClick={() => setTab("rides")}
          >
            Rides
          </button>
          <button
            className={`px-4 py-2 rounded-t-xl ${
              tab === "reports"
                ? "bg-white border border-b-0 border-slate-200 text-slate-900"
                : "bg-slate-50 text-slate-700"
            }`}
            onClick={() => setTab("reports")}
          >
            Reports
          </button>
        </nav>
      </div>

      <section className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-5">
        {loading ? (
          <Spinner />
        ) : tab === "users" ? (
          <>
            {filteredUsers.length === 0 ? (
              <p className="text-slate-700">
                No users found. Click “Load samples” to preview UI.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-slate-700">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-t border-slate-200">
                        <td className="px-4 py-3 text-slate-900">{u.name}</td>
                        <td className="px-4 py-3 text-slate-700 break-all">
                          {u.email}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{u.role}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => approveUser(u.id)}
                              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => blockUser(u.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:opacity-90"
                            >
                              Block
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : tab === "rides" ? (
          <>
            {filteredRides.length === 0 ? (
              <p className="text-slate-700">
                No rides found. Click “Load samples” to preview UI.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-slate-700">
                      <th className="px-4 py-3">Route</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Driver</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRides.map((r) => (
                      <tr key={r.id} className="border-t border-slate-200">
                        <td className="px-4 py-3 text-slate-900">
                          {r.from} → {r.to}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{r.date}</td>
                        <td className="px-4 py-3 text-slate-700">{r.driver}</td>
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          ৳ {r.price}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteRide(r.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:opacity-90"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          // Reports tab (placeholder widgets)
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-base font-semibold text-slate-900">
                Total Users
              </h4>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {users.length}
              </p>
              <p className="text-xs text-slate-600 mt-1">Sample only</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-base font-semibold text-slate-900">
                Total Rides
              </h4>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {rides.length}
              </p>
              <p className="text-xs text-slate-600 mt-1">Sample only</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-base font-semibold text-slate-900">
                Pending Drivers
              </h4>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {
                  users.filter(
                    (u) => u.role === "driver" && u.status === "pending"
                  ).length
                }
              </p>
              <p className="text-xs text-slate-600 mt-1">Sample only</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
