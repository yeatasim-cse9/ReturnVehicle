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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const registerEmail = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);
  const loginGoogle = (provider) => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  const value = {
    user,
    loading,
    loginEmail,
    registerEmail,
    loginGoogle,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
