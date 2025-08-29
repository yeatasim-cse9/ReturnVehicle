import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/GoogleButton";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { setUserRole } from "../services/authApi";

export default function Register() {
  const { registerEmail, syncWhoAmI } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("user"); // 'user' | 'driver'
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      // 1) Firebase create
      await registerEmail(form.email, form.password);
      // 2) Backend role set
      await setUserRole(role);
      await syncWhoAmI();

      toast.success("Account created");
      if (role === "driver") navigate("/driver/dashboard");
      else navigate("/user/dashboard");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
        <p className="mt-1 text-sm text-slate-600">
          Sign up to get started. Choose your role.
        </p>

        {/* Role select */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">
            Select Role
          </label>
          <div className="mt-2 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-slate-800">
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
                className="h-4 w-4"
              />
              <span>User</span>
            </label>
            <label className="inline-flex items-center gap-2 text-slate-800">
              <input
                type="radio"
                name="role"
                value="driver"
                checked={role === "driver"}
                onChange={() => setRole("driver")}
                className="h-4 w-4"
              />
              <span>Driver</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Admin role is assigned by administrators later.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
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
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Register"}
          </button>
        </form>

        {/* Google with selected role */}
        <GoogleButton label="Sign up with Google" selectedRole={role} />

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-slate-900 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
