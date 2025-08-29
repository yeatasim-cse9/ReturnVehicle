import api from "../lib/api";

const FALLBACK_LOCATIONS = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cox's Bazar",
  "Cumilla",
  "Narayanganj",
  "Gazipur",
  "Tangail",
  "Noakhali",
  "Feni",
  "Brahmanbaria",
  "Jessore",
  "Pabna",
  "Bogra",
  "Dinajpur",
  "Jamalpur",
  "Kushtia",
  "Naogaon",
  "Patuakhali",
  "Bhola",
];

/**
 * Search locations from backend, fallback to local list if API fails.
 * Backend expected: GET /api/locations?q=<string>&limit=<n>
 */
export async function searchLocations(q, limit = 8) {
  const query = (q || "").trim();
  if (!query) return [];
  try {
    const res = await api.get("/api/locations", {
      params: { q: query, limit },
    });
    const list = (res.data?.items || res.data || [])
      .map((v) => (typeof v === "string" ? v : v?.name || v?.title || ""))
      .filter(Boolean);
    return list.slice(0, limit);
  } catch {
    const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return FALLBACK_LOCATIONS.filter((name) => rx.test(name)).slice(0, limit);
  }
}
