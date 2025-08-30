import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  fetchWhoAmI,
  updateProfile as apiUpdateProfile,
} from "../services/authApi";
import { auth } from "../lib/firebase";
import { updateProfile as fbUpdateProfile } from "firebase/auth";
import { Link } from "react-router-dom";
import { User as UserIcon, Mail, ArrowLeft, Smartphone } from "lucide-react";
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

export default function ProfileEdit() {
  const { user: fbUser, syncWhoAmI } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    photoURL: "",
    phoneNumber: "",
  });

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      try {
        const u = await fetchWhoAmI();
        if (!on) return;
        setForm({
          displayName: u?.displayName || fbUser?.displayName || "",
          email: u?.email || fbUser?.email || "",
          photoURL: fbUser?.photoURL || u?.photoURL || "",
          phoneNumber: u?.phoneNumber || "", // ফোন নম্বর সেট করা হয়েছে
        });
      } catch (e) {
        toast.error(e?.message || "Failed to load profile");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [fbUser?.displayName, fbUser?.photoURL]);

  const errors = useMemo(() => {
    const e = {};
    if (!form.displayName.trim() || form.displayName.trim().length < 2)
      e.displayName = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = true;
    return e;
  }, [form]);

  const canSave = Object.keys(errors).length === 0;
  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    try {
      setSaving(true);
      await apiUpdateProfile({
        displayName: form.displayName.trim(),
        photoURL: form.photoURL.trim(),
        phoneNumber: form.phoneNumber.trim(), // ফোন নম্বর পাঠানো হয়েছে
      });
      if (auth.currentUser) {
        await fbUpdateProfile(auth.currentUser, {
          displayName: form.displayName.trim() || undefined,
          photoURL: form.photoURL.trim() || undefined,
        });
        if (auth.currentUser.reload) await auth.currentUser.reload();
      }
      await syncWhoAmI();
      toast.success("Profile updated");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Update failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ... Header ... */}
      <div className="flex items-start justify-between">
        <div>
          {" "}
          <h2 className="text-2xl font-bold text-slate-900">
            Edit Profile
          </h2>{" "}
          <p className="mt-2 text-slate-600">
            {" "}
            Update your display name and photo.{" "}
          </p>{" "}
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
        >
          {" "}
          <ArrowLeft className="h-4 w-4" /> Back{" "}
        </Link>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        {loading ? (
          <div className="inline-flex items-center gap-2 text-slate-600 text-sm">
            {" "}
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />{" "}
            Loading…{" "}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* ... Avatar and name display ... */}
            <div className="flex items-center gap-4">
              <Avatar photoURL={form.photoURL} email={form.email} size={96} />
              <div className="text-sm">
                {" "}
                <p className="text-slate-900 font-semibold">
                  {" "}
                  {form.displayName || "—"}{" "}
                </p>{" "}
                <p className="text-slate-600">{form.email || "—"}</p>{" "}
              </div>
            </div>

            {/* Display Name input */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {" "}
                Display Name{" "}
              </label>
              <div
                className={`mt-1 flex items-center rounded-xl border bg-white focus-within:ring-2 focus-within:ring-slate-400 ${
                  errors.displayName ? "border-red-500" : "border-slate-300"
                }`}
              >
                {" "}
                <span className="px-3 py-2 text-slate-700">
                  {" "}
                  <UserIcon className="h-4 w-4" />{" "}
                </span>{" "}
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => onChange("displayName", e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-r-xl bg-transparent px-3 py-2 text-slate-900 outline-none"
                  required
                />{" "}
              </div>
            </div>

            {/* Email input */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {" "}
                Email (read-only){" "}
              </label>
              <div
                className={`mt-1 flex items-center rounded-xl border bg-slate-50 ${
                  errors.email ? "border-red-500" : "border-slate-300"
                }`}
              >
                {" "}
                <span className="px-3 py-2 text-slate-700">
                  {" "}
                  <Mail className="h-4 w-4" />{" "}
                </span>{" "}
                <input
                  type="email"
                  value={form.email}
                  onChange={() => {}}
                  className="w-full rounded-r-xl bg-transparent px-3 py-2 text-slate-900 outline-none"
                  readOnly
                />{" "}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {" "}
                Email is managed by the sign-in provider.{" "}
              </p>
            </div>

            {/* ফোন নম্বরের জন্য নতুন ইনপুট ফিল্ড */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {" "}
                Phone Number{" "}
              </label>
              <div className="mt-1 flex items-center rounded-xl border bg-white focus-within:ring-2 focus-within:ring-slate-400 border-slate-300">
                <span className="px-3 py-2 text-slate-700">
                  {" "}
                  <Smartphone className="h-4 w-4" />{" "}
                </span>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => onChange("phoneNumber", e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full rounded-r-xl bg-transparent px-3 py-2 text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Photo URL input */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {" "}
                Photo URL{" "}
              </label>
              <input
                type="url"
                value={form.photoURL}
                onChange={(e) => onChange("photoURL", e.target.value)}
                placeholder="https://…"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <p className="mt-1 text-xs text-slate-500">
                {" "}
                Leave empty to show the first letter of your email as the
                avatar.{" "}
              </p>
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={!canSave || saving}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
              >
                {" "}
                {saving ? "Saving…" : "Save changes"}{" "}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
