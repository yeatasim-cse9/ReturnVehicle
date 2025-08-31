import React, { useState } from "react";
import { motion } from "motion/react";
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
    <div className="min-h-[100vh] grid place-items-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/10 p-8"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Login
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Welcome back. Please sign in to continue.
            </p>
          </motion.div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <motion.input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                className="w-full rounded-2xl border border-white/30 bg-white/50 backdrop-blur-sm px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                placeholder="you@example.com"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <motion.input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                required
                className="w-full rounded-2xl border border-white/30 bg-white/50 backdrop-blur-sm px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                placeholder="••••••••"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 text-white font-medium shadow-lg shadow-slate-900/25 hover:shadow-xl hover:shadow-slate-900/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <motion.span
                animate={loading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                transition={loading ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                {loading ? "Signing in…" : "Login"}
              </motion.span>
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-6"
          >
            {/* Google here defaults to 'user' login (role change নয়) */}
            <GoogleButton label="Continue with Google" selectedRole="user" />
          </motion.div>

          <motion.p
            className="mt-6 text-sm text-slate-600 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-slate-900 font-medium hover:text-blue-600 underline decoration-2 underline-offset-2 hover:decoration-blue-600 transition-colors duration-300"
            >
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
