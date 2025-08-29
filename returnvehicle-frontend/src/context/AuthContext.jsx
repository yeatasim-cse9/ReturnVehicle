import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import api from "../lib/api";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // firebase user
  const [loading, setLoading] = useState(true); // firebase init/loading

  const [role, setRole] = useState(null); // backend role: 'user' | 'driver' | 'admin'
  const [roleLoading, setRoleLoading] = useState(false);

  // --- Firebase auth state watcher ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      setLoading(false);

      if (u) {
        await syncWhoAmI(); // লগইন হলে রোল সিঙ্ক
      } else {
        setRole(null);
      }
    });
    return () => unsub();
  }, []);

  // --- Sync role from backend ---
  const syncWhoAmI = async () => {
    if (!auth.currentUser) {
      setRole(null);
      return;
    }
    setRoleLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await api.get("/api/auth/whoami", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const backendRole = res?.data?.user?.role || "user";
      setRole(backendRole);
    } catch (err) {
      console.error("whoami error:", err?.response?.data || err?.message);
      toast.error("Could not verify session");
      setRole(null);
    } finally {
      setRoleLoading(false);
    }
  };

  // --- Auth actions ---
  const loginEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const registerEmail = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);
  const loginGoogle = (provider) => signInWithPopup(auth, provider);
  const logout = async () => {
    await signOut(auth);
    setRole(null);
  };

  const value = {
    user,
    loading,
    role,
    roleLoading,
    syncWhoAmI, // চাইলে ম্যানুয়াল রিফ্রেশও করা যাবে
    loginEmail,
    registerEmail,
    loginGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
