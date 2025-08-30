import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchWhoAmI } from "../services/authApi";
import { Mail, Shield, Smartphone } from "lucide-react"; // Smartphone আইকন যোগ করা হয়েছে

// ... Avatar component ...
function Avatar({ photoURL, email, size = 96 }) {
  const letter = (email || "").trim().charAt(0).toUpperCase();
  return photoURL ? (
    <img
      src={photoURL}
      alt="avatar"
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-full bg-slate-200 text-slate-700 grid place-items-center font-semibold"
      style={{ width: size, height: size }}
      aria-label={letter || "U"}
      title={email || ""}
    >
      {" "}
      {letter || "U"}{" "}
    </div>
  );
}

export default function Profile() {
  const { user: fbUser, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [u, setU] = useState(null);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const data = await fetchWhoAmI();
        if (!on) return;
        setU({ ...data, photoURL: fbUser?.photoURL || data?.photoURL || "" });
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [fbUser?.photoURL, fbUser?.displayName]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ... Header ... */}
      <div className="flex items-start justify-between">
        <div>
          {" "}
          <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>{" "}
          <p className="mt-2 text-slate-600">View your account details.</p>{" "}
        </div>
        <Link
          to="/profile/edit"
          className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
        >
          {" "}
          Edit Profile{" "}
        </Link>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        {loading ? (
          <div className="inline-flex items-center gap-2 text-slate-600 text-sm">
            {" "}
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />{" "}
            Loading…{" "}
          </div>
        ) : !u ? (
          <p className="text-slate-700">No profile found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Avatar photoURL={u.photoURL} email={u.email} size={96} />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs text-slate-600">Name</label>
                <p className="text-slate-900 font-medium text-base">
                  {u.displayName || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-700" />
                <div>
                  {" "}
                  <label className="block text-xs text-slate-600">
                    Email
                  </label>{" "}
                  <p className="text-slate-900">{u.email || "—"}</p>{" "}
                </div>
              </div>
              {/* ফোন নম্বর দেখানোর সেকশন */}
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-slate-700" />
                <div>
                  {" "}
                  <label className="block text-xs text-slate-600">
                    Phone Number
                  </label>{" "}
                  <p className="text-slate-900">{u.phoneNumber || "—"}</p>{" "}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-700" />
                <div>
                  {" "}
                  <label className="block text-xs text-slate-600">
                    Role
                  </label>{" "}
                  <p className="text-slate-900">{u.role || role || "user"}</p>{" "}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
