// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  CarTaxiFront,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Settings,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";

// Avatar Component
function Avatar({ user }) {
  const photoURL = user?.photoURL;
  const name = user?.displayName || user?.email || "";
  const letter = name.charAt(0).toUpperCase();

  return photoURL ? (
    <img
      src={photoURL}
      alt="avatar"
      className="h-8 w-8 rounded-full object-cover"
    />
  ) : (
    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 grid place-items-center font-semibold">
      {letter || <UserIcon size={16} />}
    </div>
  );
}

// Main Header Component
export default function Header() {
  const { user, logout, role } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;
  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-2 text-base rounded-lg ${
      isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  const dashboardPath =
    {
      user: "/user/dashboard",
      driver: "/driver/dashboard",
      admin: "/admin/dashboard",
    }[role] || "/";

  const navLinks = (
    <>
      <NavLink
        to="/"
        className={mobileMenuOpen ? mobileNavLinkClass : navLinkClass}
      >
        Home
      </NavLink>
      <NavLink
        to="/rides"
        className={mobileMenuOpen ? mobileNavLinkClass : navLinkClass}
      >
        Rides
      </NavLink>
      <NavLink
        to="/about"
        className={mobileMenuOpen ? mobileNavLinkClass : navLinkClass}
      >
        About
      </NavLink>
      {user && (
        <NavLink
          to={dashboardPath}
          className={mobileMenuOpen ? mobileNavLinkClass : navLinkClass}
        >
          Dashboard
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-slate-900"
          >
            <CarTaxiFront className="w-6 h-6 text-slate-800" />
            <span className="text-lg">ReturnVehicle</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">{navLinks}</nav>

          {/* Auth buttons & User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2"
                >
                  <Avatar user={user} />
                </button>
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to={dashboardPath}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Settings size={16} /> Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 space-y-2">
          {navLinks}
          {!user && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <Link
                to="/login"
                className="block text-center w-full px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block text-center w-full px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
