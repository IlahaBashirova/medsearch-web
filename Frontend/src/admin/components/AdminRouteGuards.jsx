import React from "react";
import { Navigate } from "react-router-dom";
import { clearToken, getSessionUser, getToken, isSessionExpired } from "../../lib/auth.js";

export function RequireAdmin({ children }) {
  const token = getToken();
  const { role } = getSessionUser();

  if (!token) return <Navigate to="/admin/login" replace />;

  if (isSessionExpired()) {
    clearToken();
    return <Navigate to="/admin/login" replace />;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export function RequireAdminGuest({ children }) {
  const token = getToken();
  const { role } = getSessionUser();

  if (!token || isSessionExpired()) return children;

  if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;

  return children;
}
