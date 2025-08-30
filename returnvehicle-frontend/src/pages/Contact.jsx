// returnvehicle-frontend/src/pages/Contact.jsx
import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

// Interactive map card centered on Khulna using OpenStreetMap embed.
// You can override the map provider by setting VITE_MAP_IFRAME_SRC in your .env.
function KhulnaMap() {
  // Khulna coordinates (WGS84)
  const lat = 22.80979;
  const lon = 89.56439;

  // Build an OpenStreetMap embed URL with bounding box + marker
  // OSM embed params: bbox=minLon,minLat,maxLon,maxLat, layer=mapnik, marker=lat,lon
  const dLat = 0.05;
  const dLon = 0.08;
  const bbox = [
    (lon - dLon).toFixed(6),
    (lat - dLat).toFixed(6),
    (lon + dLon).toFixed(6),
    (lat + dLat).toFixed(6),
  ].join("%2C");

  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  const src = import.meta.env.VITE_MAP_IFRAME_SRC || osmEmbed;

  return (
    <div className="relative">
      <div className="p-[2px] rounded-2xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500">
        <div className="rounded-2xl overflow-hidden bg-white">
          <iframe
            title="Khulna Map"
            src={src}
            className="w-full h-[300px] md:h-[360px]"
            loading="lazy"
            // OSM embed requires allow-scripts; keep sandbox minimal
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-white/90 backdrop-blur text-slate-900 shadow">
        <MapPin className="h-4 w-4" />
        Khulna, Bangladesh
      </span>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Validation uses boolean flags only (no inline error messages)
  const errors = useMemo(() => {
    const e = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!name || name.length < 2) e.name = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = true;
    if (!subject) e.subject = true;
    if (!message || message.length < 10) e.message = true;
    return e;
  }, [form]);

  const canSubmit = Object.keys(errors).length === 0;
  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    try {
      setSubmitting(true);
      // Simulate async send; wire to backend later if desired
      await new Promise((r) => setTimeout(r, 700));
      toast.success("Message sent — we'll get back to you soon");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err?.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-slate-50 to-white">
      {/* Gradient hero header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-10 text-white">
          <h2 className="text-2xl md:text-3xl font-bold">Contact</h2>
          <p className="mt-2 text-white/90">
            Reach out to the team and check the Khulna office location below.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: contact details + map */}
        <section className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-700 mt-0.5" />
                <div>
                  <p className="text-slate-900 font-medium">Email</p>
                  <p className="text-slate-700">support@returnvehicle.local</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-slate-700 mt-0.5" />
                <div>
                  <p className="text-slate-900 font-medium">Phone</p>
                  <p className="text-slate-700">+880 1XXXXXXXXX</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-slate-700 mt-0.5" />
                <div>
                  <p className="text-slate-900 font-medium">Hours</p>
                  <p className="text-slate-700">Sat–Thu, 9:00–18:00</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-700 mt-0.5" />
                <div>
                  <p className="text-slate-900 font-medium">Address</p>
                  <p className="text-slate-700">Khulna, Bangladesh</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <KhulnaMap />
          </div>
        </section>

        {/* Right column: contact form (no inline error text) */}
        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Send a message
          </h3>
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Full name"
                  required
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                    errors.name ? "border-red-500" : "border-slate-300"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                    errors.email ? "border-red-500" : "border-slate-300"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Subject
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => onChange("subject", e.target.value)}
                placeholder="How can we help?"
                required
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                  errors.subject ? "border-red-500" : "border-slate-300"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Message
              </label>
              <textarea
                rows={6}
                value={form.message}
                onChange={(e) => onChange("message", e.target.value)}
                placeholder="Please include as much detail as possible…"
                required
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                  errors.message ? "border-red-500" : "border-slate-300"
                }`}
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>

          <p className="mt-3 text-xs text-slate-500">
            This form shows a local success toast; connect a backend endpoint
            later if needed.
          </p>
        </section>
      </div>
    </div>
  );
}
