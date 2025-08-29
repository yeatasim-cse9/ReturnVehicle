import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

// কেবল লগইন ইউজারের জন্য
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

// লগইন + নির্দিষ্ট রোলের জন্য
export function RoleRoute({ allow = [] }) {
  const { user, loading, role, roleLoading } = useAuth();

  if (loading || roleLoading) return <Spinner label="Checking permission..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (allow.length && !allow.includes(role))
    return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}
