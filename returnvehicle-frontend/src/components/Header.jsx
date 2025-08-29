import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Car, LogIn, UserPlus, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl text-sm font-medium ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"
  }`;

export default function Header() {
  const { user, logout, role, updateRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-slate-900"
        >
          <Car className="w-6 h-6" />
          <span className="text-lg">ReturnVehicle</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>

          {/* ড্যাশবোর্ড শর্টকাট (role অনুযায়ী) */}
          {user && (
            <>
              {role === "user" && (
                <NavLink to="/user/dashboard" className={navLinkClass}>
                  User
                </NavLink>
              )}
              {role === "driver" && (
                <NavLink to="/driver/dashboard" className={navLinkClass}>
                  Driver
                </NavLink>
              )}
              {role === "admin" && (
                <NavLink to="/admin/dashboard" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* TEMP: Dev-only role switcher (frontend) */}
              <select
                aria-label="Role"
                className="hidden sm:block rounded-xl border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                value={role}
                onChange={(e) => updateRole(e.target.value)}
              >
                <option value="user">user</option>
                <option value="driver">driver</option>
                <option value="admin">admin</option>
              </select>

              <span className="hidden sm:inline-block text-xs px-2 py-1 rounded-lg bg-slate-200 text-slate-800">
                {role}
              </span>

              <button
                onClick={logout}
                className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-slate-900 hover:opacity-90"
              >
                <span className="inline-flex items-center gap-1">
                  <LogOut size={16} /> Logout
                </span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                <span className="inline-flex items-center gap-1">
                  <LogIn size={16} /> Login
                </span>
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                <span className="inline-flex items-center gap-1">
                  <UserPlus size={16} /> Register
                </span>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
