import React, { useState } from "react";
import { motion } from "motion/react";
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
    <div className="min-h-[100vh] p-10 grid place-items-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
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
              Create Account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Sign up to get started. Choose your role.
            </p>
          </motion.div>

          {/* Role select */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select Role
            </label>
            <div className="flex items-center gap-6">
              <motion.label
                className="inline-flex items-center gap-3 text-slate-800 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === "user"}
                  onChange={() => setRole("user")}
                  className="h-4 w-4 text-blue-600 border-2 border-blue-300 focus:ring-blue-500 focus:ring-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
                <span className="select-none">User</span>
              </motion.label>
              <motion.label
                className="inline-flex items-center gap-3 text-slate-800 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.input
                  type="radio"
                  name="role"
                  value="driver"
                  checked={role === "driver"}
                  onChange={() => setRole("driver")}
                  className="h-4 w-4 text-blue-600 border-2 border-blue-300 focus:ring-blue-500 focus:ring-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
                <span className="select-none">Driver</span>
              </motion.label>
            </div>
            <motion.p
              className="mt-2 text-xs text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Admin role is assigned by administrators later.
            </motion.p>
          </motion.div>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
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
              transition={{ delay: 0.4, duration: 0.4 }}
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
                placeholder="Min 6 characters"
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
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <motion.span
                animate={loading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                transition={loading ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                {loading ? "Creating…" : "Register"}
              </motion.span>
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-6"
          >
            {/* Google with selected role */}
            <GoogleButton label="Sign up with Google" selectedRole={role} />
          </motion.div>

          <motion.p
            className="mt-6 text-sm text-slate-600 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-slate-900 font-medium hover:text-blue-600 underline decoration-2 underline-offset-2 hover:decoration-blue-600 transition-colors duration-300"
            >
              Login
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
