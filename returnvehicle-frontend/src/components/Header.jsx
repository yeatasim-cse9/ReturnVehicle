import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Car, LogIn, UserPlus, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl text-sm font-medium ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"
  }`;

export default function Header() {
  const { user, logout } = useAuth();

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
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-slate-700">
                {user.email}
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
