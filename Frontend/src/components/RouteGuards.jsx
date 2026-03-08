import React from "react";
import { Navigate } from "react-router-dom";
import { clearToken, getToken, isSessionExpired } from "../lib/auth.js";

export function RequireAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/auth" replace />;

  if (isSessionExpired()) {
    clearToken();
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export function RequireGuest({ children }) {
  const token = getToken();
  if (token && !isSessionExpired()) return <Navigate to="/home" replace />;
  return children;
}