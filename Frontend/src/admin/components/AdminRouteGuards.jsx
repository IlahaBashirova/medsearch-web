import React from "react";
import { Navigate } from "react-router-dom";
import { clearToken, getToken, isSessionExpired } from "../../lib/auth.js";
import { jwtDecode } from "../../lib/jwtDecode.js";

function getAdminSession() {
  const token = getToken();

  if (!token) return { token: "", role: "" };

  const decoded = jwtDecode(token);
  return {
    token,
    role: decoded?.role || ""
  };
}

export function RequireAdmin({ children }) {
  const { token, role } = getAdminSession();

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
  const { token, role } = getAdminSession();

  if (!token || isSessionExpired()) return children;

  if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;

  return children;
}
