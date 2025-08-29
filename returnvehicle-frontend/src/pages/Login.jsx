import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/GoogleButton";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { fetchWhoAmI } from "../services/authApi";

export default function Login() {
  const { loginEmail } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginEmail(form.email, form.password);
      const u = await fetchWhoAmI();
      toast.success("Logged in");

      if (u?.role === "driver") navigate("/driver/dashboard");
      else if (u?.role === "admin") navigate("/admin/dashboard");
      else navigate("/user/dashboard");
    } catch (err) {
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900">Login</h2>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back. Please sign in to continue.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        {/* Google here defaults to 'user' login (role change নয়) */}
        <GoogleButton label="Continue with Google" selectedRole="user" />

        <p className="mt-4 text-sm text-slate-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-slate-900 underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
