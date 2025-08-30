// returnvehicle-frontend/src/services/http.js
import axios from "axios";
import { getAuth } from "firebase/auth";

// API base URL নেয়া (env থেকে না থাকলে লোকাল)
const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000";

// সব সার্ভিস এই api instance ইউজ করবে
const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: { "Content-Type": "application/json" },
});

// প্রতিটি রিকোয়েস্টের আগে Firebase ID token অ্যাটাচ করি
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      // ইউজার লগইন থাকলে ফ্রেশ টোকেন নিয়ে সেট করো
      if (user) {
        const token = await user.getIdToken(true); // force refresh
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // টোকেন না পেলেও পাবলিক রুটগুলোর জন্য রিকোয়েস্ট যেতে দাও
      // ডিবাগ লাগলে কনসোল আনকমেন্ট করতে পারো:
      // console.warn("Auth token attach failed:", e?.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401/403 এ হিন্ট দেই (optional)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // ডিবাগের জন্য হেল্পফুল মেসেজ
      console.warn(
        `[API ${status}] Auth required or role mismatch. Make sure you're signed in with the correct role.`
      );
    }
    return Promise.reject(error);
  }
);

export default api;
