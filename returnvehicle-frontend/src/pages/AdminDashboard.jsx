// returnvehicle-frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { adminListUsers } from "../services/adminApi";

function Spinner({ label = "Loading..." }) {
  return (
    <div className="inline-flex items-center gap-2 text-slate-600 text-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}

export default function AdminDashboard() {
  // ---- Users tab state ----
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    total: 0,
    pages: 1,
    limit: 10,
  });

  const roles = useMemo(() => ["", "user", "driver", "admin"], []);
  // নোট: ব্যাকএন্ড স্কিমায় status enum ["approved","blocked"]; UI-তে পূর্বে "active/pending" প্লেসহোল্ডার ছিল
  const statuses = useMemo(() => ["", "approved", "blocked"], []);

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const data = await adminListUsers({
        query,
        role,
        status,
        page: p,
        limit: pageInfo.limit || 10,
      });
      setUsers(data.items || []);
      setPage(p);
      setPageInfo({
        total: data.total,
        pages: data.pages,
        limit: data.limit,
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const clearFilters = () => {
    setQuery("");
    setRole("");
    setStatus("");
    fetchUsers(1);
  };

  const goPage = (p) => {
    const next = Math.max(1, Math.min(pageInfo.pages, p));
    fetchUsers(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
      <p className="mt-2 text-slate-600">
        Manage users. (Rides & analytics পরে এড করবো)
      </p>

      {/* Filters */}
      <form
        onSubmit={applyFilters}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-slate-700">Search</label>
            <input
              type="text"
              placeholder="name/email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
            >
              {roles.map((r, i) => (
                <option key={r || `any-${i}`} value={r}>
                  {r ? r : "Any"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
            >
              {statuses.map((s, i) => (
                <option key={s || `any-${i}`} value={s}>
                  {s ? s : "Any"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => fetchUsers(page)}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </form>

      {/* Users table */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white overflow-x-auto">
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Users</h3>
          {loading ? (
            <Spinner />
          ) : (
            <span className="text-sm text-slate-600">
              {pageInfo.total} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="px-4 pb-4">
            <Spinner label="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <div className="px-4 pb-4 text-slate-700">No users found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-700">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">RoleStatus</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const nameCell =
                  (u?.displayName && u.displayName.trim()) || u?.email || "—";
                const roleLabel = u?.role || "user";
                const statusLabel = u?.status || "approved";
                return (
                  <tr
                    key={u?.uid || u?._id || i}
                    className="border-t border-slate-200"
                  >
                    <td className="px-4 py-3 text-slate-900">{nameCell}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {u?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {u?.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                        {roleLabel} / {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {u?.createdAt
                        ? new Date(u.createdAt).toISOString().slice(0, 10)
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && pageInfo.pages > 1 && (
          <div className="px-4 py-4 flex items-center justify-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span className="text-sm text-slate-700">
              Page <strong className="text-slate-900">{page}</strong> of{" "}
              {pageInfo.pages}
            </span>
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-60"
              onClick={() => goPage(page + 1)}
              disabled={page >= pageInfo.pages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
