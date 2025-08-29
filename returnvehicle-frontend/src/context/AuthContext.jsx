import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
} from "firebase/auth";

const AuthContext = createContext(null);

// ---- TEMP ROLE STORAGE (frontend-only) ----
// পরে MongoDB/API থেকে আসল role আনবো।
// key: 'rv_role' | allowed: 'user' | 'driver' | 'admin'
function getStoredRole() {
  const r = localStorage.getItem("rv_role");
  return r || "user";
}
function setStoredRole(role) {
  localStorage.setItem("rv_role", role);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // role states
  const [role, setRole] = useState(getStoredRole());
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
      // লগইন হলে ভবিষ্যতে API দিয়ে রোল ফেচ করবো।
      // এখন টেম্পোরারি localStorage role ব্যবহার করছি।
    });
    return () => unsub();
  }, []);

  // role setter (temp)
  const updateRole = (nextRole) => {
    setRoleLoading(true);
    setStoredRole(nextRole);
    setRole(nextRole);
    setRoleLoading(false);
  };

  const loginEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const registerEmail = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);
  const loginGoogle = (provider) => signInWithPopup(auth, provider);
  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    role,
    roleLoading,
    updateRole, // TEMP: dev helper
    loginEmail,
    registerEmail,
    loginGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
