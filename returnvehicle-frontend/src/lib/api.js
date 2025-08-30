// frontend/src/lib/api.js
// Pre-configured Axios instance that automatically adds Firebase ID token.
// Make sure you have `auth` exported from ../lib/firebase

import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000",
  timeout: 20000,
});

// ✅ Add Firebase ID token to every request (if logged in)
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken(); // refresh handled by SDK
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // ignore; backend will 401 if truly unauthenticated
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// (optional) You can log 401s for debugging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // console.debug('API error', err?.response?.status, err?.response?.data)
    return Promise.reject(err);
  }
);

export default api;
