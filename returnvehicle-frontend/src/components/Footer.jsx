// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { CarTaxiFront } from "lucide-react";
import { FaGithub, FaFacebook } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding Section */}
          <div className="md:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-slate-900"
            >
              <CarTaxiFront className="w-6 h-6" />
              <span className="text-lg">ReturnVehicle</span>
            </Link>
            <p className="mt-2 text-sm text-slate-600">
              Your trusted partner for ride-sharing across Bangladesh.
            </p>
          </div>

          {/* Links Sections */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900">Pages</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rides"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Available Rides
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Actions</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    to="/register"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Become a Driver
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user/dashboard"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    My Bookings
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} ReturnVehicle. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="text-slate-500 hover:text-slate-800">
              <FaSquareXTwitter size={20} />
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-800">
              <FaFacebook size={20} />
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-800">
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
