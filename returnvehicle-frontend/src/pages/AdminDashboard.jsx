import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  adminListUsers,
  adminUpdateUser,
  adminListRides,
  adminDeleteRide,
} from "../services/adminApi";
import { useAuth } from "../context/AuthContext";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}

export default function AdminDashboard() {
  const { user: me } = useAuth();

  const [tab, setTab] = useState("users"); // 'users' | 'rides' | 'reports'

  // ---- Users state ----
  const [uLoading, setULoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [uPage, setUPage] = useState(1);
  const [uPages, setUPages] = useState(1);
  const [uTotal, setUTotal] = useState(0);
  const [uLimit] = useState(10);
  const [uQuery, setUQuery] = useState("");
  const [uRoleFilter, setURoleFilter] = useState("");
  const [uStatusFilter, setUStatusFilter] = useState("");
  const [uActingUid, setUActingUid] = useState(null);

  // ---- Rides state ----
  const [rLoading, setRLoading] = useState(false);
  const [rides, setRides] = useState([]);
  const [rPage, setRPage] = useState(1);
  const [rPages, setRPages] = useState(1);
  const [rTotal, setRTotal] = useState(0);
  const [rLimit] = useState(10);
  const [rQuery, setRQuery] = useState("");
  const [rStatusFilter, setRStatusFilter] = useState("");
  const [rCategoryFilter, setRCategoryFilter] = useState("");
  const [rActingId, setRActingId] = useState(null);

  // ---- Loaders ----
  const fetchUsers = async (page = 1) => {
    setULoading(true);
    try {
      const res = await adminListUsers({
        query: uQuery.trim(),
        role: uRoleFilter,
        status: uStatusFilter,
        page,
        limit: uLimit,
      });
      setUsers(res.items || []);
      setUPage(res.page);
      setUPages(res.pages);
      setUTotal(res.total);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load users"
      );
    } finally {
      setULoading(false);
    }
  };

  const fetchRides = async (page = 1) => {
    setRLoading(true);
    try {
      const res = await adminListRides({
        query: rQuery.trim(),
        status: rStatusFilter,
        category: rCategoryFilter,
        page,
        limit: rLimit,
      });
      setRides(res.items || []);
      setRPage(res.page);
      setRPages(res.pages);
      setRTotal(res.total);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load rides"
      );
    } finally {
      setRLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "users") fetchUsers(1);
  }, [tab]);

  useEffect(() => {
    if (tab === "rides") fetchRides(1);
  }, [tab]);

  // ---- Users actions ----
  const onApprove = async (uid) => {
    try {
      setUActingUid(uid);
      const updated = await adminUpdateUser(uid, { status: "approved" });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, status: updated.status } : u))
      );
      toast.success("User approved");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Approve failed"
      );
    } finally {
      setUActingUid(null);
    }
  };

  const onBlock = async (uid) => {
    try {
      setUActingUid(uid);
      const updated = await adminUpdateUser(uid, { status: "blocked" });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, status: updated.status } : u))
      );
      toast.success("User blocked");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Block failed"
      );
    } finally {
      setUActingUid(null);
    }
  };

  const onChangeRole = async (uid, role) => {
    try {
      setUActingUid(uid);
      const updated = await adminUpdateUser(uid, { role });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: updated.role } : u))
      );
      toast.success("Role updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Role update failed"
      );
    } finally {
      setUActingUid(null);
    }
  };

  // ---- Rides actions ----
  const onDeleteRide = async (id) => {
    if (!window.confirm("Delete this ride?")) return;
    try {
      setRActingId(id);
      await adminDeleteRide(id);
      setRides((prev) => prev.filter((r) => r._id !== id && r.id !== id));
      toast.success("Ride deleted");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Delete failed"
      );
    } finally {
      setRActingId(null);
    }
  };

  // ---- Derived ----
  const myUid = me?.uid || me?.uid; // keep for clarity

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
          <p className="mt-1 text-slate-600 text-sm">
            Manage users, rides, and view reports.
          </p>
        </div>

        {/* Search & filters (contextual per tab) */}
        {tab === "users" ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={uQuery}
              onChange={(e) => setUQuery(e.target.value)}
              placeholder="Search users"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <select
              value={uRoleFilter}
              onChange={(e) => setURoleFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">All roles</option>
              <option value="user">user</option>
              <option value="driver">driver</option>
              <option value="admin">admin</option>
            </select>
            <select
              value={uStatusFilter}
              onChange={(e) => setUStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">All status</option>
              <option value="approved">approved</option>
              <option value="blocked">blocked</option>
            </select>
            <button
              type="button"
              onClick={() => fetchUsers(1)}
              className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
            >
              Search
            </button>
          </div>
        ) : tab === "rides" ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={rQuery}
              onChange={(e) => setRQuery(e.target.value)}
              placeholder="Search rides"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <select
              value={rStatusFilter}
              onChange={(e) => setRStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">All status</option>
              <option value="available">available</option>
              <option value="unavailable">unavailable</option>
            </select>
            <select
              value={rCategoryFilter}
              onChange={(e) => setRCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">All categories</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Car">Car</option>
              <option value="Truck">Truck</option>
            </select>
            <button
              type="button"
              onClick={() => fetchRides(1)}
              className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
            >
              Search
            </button>
          </div>
        ) : null}
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
        {tab === "users" ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Users</h3>
              {uLoading ? (
                <Spinner />
              ) : (
                <span className="text-sm text-slate-600">{uTotal} total</span>
              )}
            </div>

            {uLoading ? (
              <div className="mt-4">
                <Spinner label="Loading users..." />
              </div>
            ) : users.length === 0 ? (
              <p className="mt-2 text-slate-700">No users found.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
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
                    {users.map((u) => (
                      <tr key={u.uid} className="border-t border-slate-200">
                        <td className="px-4 py-3 text-slate-900">
                          {u.displayName || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700 break-all">
                          {u.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <select
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-900"
                            value={u.role}
                            onChange={(e) =>
                              onChangeRole(u.uid, e.target.value)
                            }
                            disabled={uActingUid === u.uid || u.uid === myUid} // নিজের রোল না পাল্টাই
                          >
                            <option value="user">user</option>
                            <option value="driver">driver</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                            {u.status || "approved"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => onApprove(u.uid)}
                              disabled={uActingUid === u.uid}
                              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onBlock(u.uid)}
                              disabled={uActingUid === u.uid || u.uid === myUid}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
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

            {/* Users pagination */}
            {!uLoading && uPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
                  onClick={() => fetchUsers(uPage - 1)}
                  disabled={uPage <= 1}
                >
                  Prev
                </button>
                <span className="text-sm text-slate-700">
                  Page <strong className="text-slate-900">{uPage}</strong> of{" "}
                  {uPages}
                </span>
                <button
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
                  onClick={() => fetchUsers(uPage + 1)}
                  disabled={uPage >= uPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : tab === "rides" ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Rides</h3>
              {rLoading ? (
                <Spinner />
              ) : (
                <span className="text-sm text-slate-600">{rTotal} total</span>
              )}
            </div>

            {rLoading ? (
              <div className="mt-4">
                <Spinner label="Loading rides..." />
              </div>
            ) : rides.length === 0 ? (
              <p className="mt-2 text-slate-700">No rides found.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-slate-700">
                      <th className="px-4 py-3">Route</th>
                      <th className="px-4 py-3">Journey</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.map((r) => (
                      <tr key={r._id} className="border-t border-slate-200">
                        <td className="px-4 py-3 text-slate-900">
                          {r.from} → {r.to}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {r.journeyDate
                            ? new Date(r.journeyDate).toISOString().slice(0, 10)
                            : "—"}
                          {r.returnDate
                            ? ` • ${new Date(r.returnDate)
                                .toISOString()
                                .slice(0, 10)}`
                            : ""}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {r.vehicleModel || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          ৳ {r.price}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {r.category}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onDeleteRide(r._id)}
                            disabled={rActingId === r._id}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
                          >
                            {rActingId === r._id ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rides pagination */}
            {!rLoading && rPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
                  onClick={() => fetchRides(rPage - 1)}
                  disabled={rPage <= 1}
                >
                  Prev
                </button>
                <span className="text-sm text-slate-700">
                  Page <strong className="text-slate-900">{rPage}</strong> of{" "}
                  {rPages}
                </span>
                <button
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
                  onClick={() => fetchRides(rPage + 1)}
                  disabled={rPage >= rPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          // Reports (simple placeholders)
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-base font-semibold text-slate-900">
                Users (page)
              </h4>
              <p className="mt-2 text-3xl font-bold text-slate-900">{uTotal}</p>
              <p className="text-xs text-slate-600 mt-1">Loaded via API</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-base font-semibold text-slate-900">
                Rides (page)
              </h4>
              <p className="mt-2 text-3xl font-bold text-slate-900">{rTotal}</p>
              <p className="text-xs text-slate-600 mt-1">Loaded via API</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-base font-semibold text-slate-900">
                Quick Actions
              </h4>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (tab !== "users") setTab("users");
                    fetchUsers(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                >
                  Refresh Users
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tab !== "rides") setTab("rides");
                    fetchRides(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
                >
                  Refresh Rides
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
